// Server-side game state machine for Wolvesville-style Werewolf

export const PHASES = {
  LOBBY: 'LOBBY',
  ROLE_REVEAL: 'ROLE_REVEAL',
  NIGHT: 'NIGHT',
  NIGHT_RESULTS: 'NIGHT_RESULTS',
  DAY_DISCUSS: 'DAY_DISCUSS',
  DAY_VOTE: 'DAY_VOTE',
  VOTE_RESULTS: 'VOTE_RESULTS',
  ENDED: 'ENDED',
};

export const ROLES = {
  WEREWOLF: { id: 'werewolf', name: 'Werewolf', team: 'wolf', emoji: '�', color: '#e74c3c' },
  SEER: { id: 'seer', name: 'Seer', team: 'town', emoji: '🔮', color: '#3498db' },
  BODYGUARD: { id: 'bodyguard', name: 'Bodyguard', team: 'town', emoji: '🛡️', color: '#27ae60' },
  MEDIUM: { id: 'medium', name: 'Medium', team: 'town', emoji: '👻', color: '#9b59b6' },
  VILLAGER: { id: 'villager', name: 'Villager', team: 'town', emoji: '🏘️', color: '#f39c12' },
  FOOL: { id: 'fool', name: 'Fool', team: 'town', emoji: '🤡', color: '#e67e22' },
};

export class WerewolfGame {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = [];
    this.phase = PHASES.LOBBY;
    this.dayNumber = 0;
    this.log = [];
    this.graveyard = [];
    this.votes = {};
    this.nightActions = {};
    this.winner = null;
    this.phaseStartTime = null;
    this.phaseDuration = null;
    this.roleDeck = {
      werewolf: 2,
      seer: 1,
      bodyguard: 1,
      medium: 0,
      villager: 6,
      fool: 0,
    };
  }

  addPlayer(id, name, avatar = '') {
    if (this.players.length >= 16) return { ok: false, error: 'Room full' };
    if (this.players.find(p => p.id === id)) return { ok: false, error: 'Already in room' };
    if (this.phase !== PHASES.LOBBY) return { ok: false, error: 'Game already started' };
    
    const player = {
      id,
      name,
      avatar,
      role: null,
      alive: true,
      isHost: id === this.hostId,
      vote: null,
      hasActed: false,
      isProtected: false,
    };
    this.players.push(player);
    this.log.push(`👋 ${name} joined the village`);
    return { ok: true, player };
  }

  removePlayer(id) {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx === -1) return;
    const player = this.players[idx];
    if (this.phase === PHASES.LOBBY) {
      this.players.splice(idx, 1);
    } else {
      // Mark as disconnected but keep role
      player.connected = false;
    }
    this.log.push(`💨 ${player.name} left`);
  }

  start(customDeck) {
    if (this.phase !== PHASES.LOBBY) return { ok: false, error: 'Game already started' };
    if (this.players.length < 4) return { ok: false, error: 'Need at least 4 players' };

    const deck = customDeck || this.roleDeck;
    const totalRoles = Object.values(deck).reduce((a, b) => a + b, 0);
    if (totalRoles !== this.players.length) {
      return { ok: false, error: `Role count (${totalRoles}) must match player count (${this.players.length})` };
    }

    // Build role list and shuffle
    const roleList = [];
    for (const [roleId, count] of Object.entries(deck)) {
      for (let i = 0; i < count; i++) {
        roleList.push(roleId);
      }
    }
    this.shuffleArray(roleList);

    // Assign roles
    const assignments = [];
    this.players.forEach((player, i) => {
      player.role = roleList[i];
      assignments.push({
        id: player.id,
        role: roleList[i],
        team: ROLES[roleList[i].toUpperCase()]?.team || 'town',
      });
    });

    this.dayNumber = 1;
    this.log.push(`🎬 Game started! Day ${this.dayNumber} begins...`);
    
    // Go to role reveal first
    this.transitionTo(PHASES.ROLE_REVEAL, 5);
    
    return { ok: true, assignments };
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  transitionTo(phase, duration = null) {
    this.phase = phase;
    this.phaseStartTime = Date.now();
    this.phaseDuration = duration ? duration * 1000 : null;
    
    // Reset night actions / votes
    if (phase === PHASES.NIGHT) {
      this.nightActions = {};
      this.players.forEach(p => {
        if (p.alive) p.hasActed = false;
        p.isProtected = false;
      });
    } else if (phase === PHASES.DAY_VOTE) {
      this.votes = {};
      this.players.forEach(p => {
        if (p.alive) p.vote = null;
      });
    }
    
    this.log.push(`⏰ Phase changed: ${phase}`);
  }

  // === Night Actions ===
  
  submitNightAction(playerId, targetId, ability) {
    const player = this.players.find(p => p.id === playerId);
    const target = this.players.find(p => p.id === targetId);
    
    if (!player || !target || !player.alive || !target.alive) {
      return { ok: false, error: 'Invalid action' };
    }
    if (this.phase !== PHASES.NIGHT) {
      return { ok: false, error: 'Not night phase' };
    }

    switch (player.role) {
      case 'werewolf':
        // Wolves vote on target
        if (!this.nightActions.wolves) this.nightActions.wolves = {};
        this.nightActions.wolves[playerId] = targetId;
        player.hasActed = true;
        this.log.push(`🐺 ${player.name} chose to attack ${target.name}`);
        return { ok: true, role: 'werewolf' };
      
      case 'seer':
        // Reveal target's role
        player.hasActed = true;
        const result = { role: target.role, team: ROLES[target.role.toUpperCase()]?.team };
        this.log.push(`🔮 ${player.name} divined ${target.name}`);
        return { ok: true, role: 'seer', inspectResult: result };
      
      case 'bodyguard':
        // Protect target
        target.isProtected = true;
        player.hasActed = true;
        this.log.push(`�️ ${player.name} protected ${target.name}`);
        return { ok: true, role: 'bodyguard' };
      
      default:
        return { ok: false, error: 'No night action for this role' };
    }
  }

  resolveNight() {
    // Get wolf vote target (majority)
    const wolfVotes = this.nightActions.wolves || {};
    const voteCounts = {};
    for (const targetId of Object.values(wolfVotes)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
    
    let wolfTarget = null;
    let maxVotes = 0;
    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        wolfTarget = targetId;
        maxVotes = count;
      }
    }

    if (wolfTarget) {
      const target = this.players.find(p => p.id === wolfTarget);
      if (target && !target.isProtected) {
        target.alive = false;
        this.graveyard.push(target);
        this.log.push(`💀 ${target.name} was killed by wolves! They were a ${ROLES[target.role.toUpperCase()]?.name}`);
      } else if (target?.isProtected) {
        this.log.push(`🛡️ ${target.name} was protected! No one died tonight.`);
      }
    } else {
      this.log.push(`🌙 No one was killed tonight`);
    }

    this.transitionTo(PHASES.NIGHT_RESULTS, 3);
  }

  // === Day Voting ===
  
  castVote(voterId, targetId) {
    const voter = this.players.find(p => p.id === voterId);
    const target = this.players.find(p => p.id === targetId);
    
    if (!voter || !voter.alive) return { ok: false, error: 'Not alive' };
    if (this.phase !== PHASES.DAY_VOTE) return { ok: false, error: 'Not voting' };
    
    voter.vote = targetId;
    this.votes[voterId] = targetId;
    this.log.push(`🗳️ ${voter.name} voted`);
    return { ok: true };
  }

  resolveVote() {
    const voteCounts = {};
    for (const targetId of Object.values(this.votes)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
    
    let executed = null;
    let maxVotes = 0;
    let tie = false;
    
    const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      maxVotes = parseInt(sorted[0][1]);
      const tiedPlayers = sorted.filter(([_, c]) => c === maxVotes).map(([id]) => id);
      if (tiedPlayers.length === 1) {
        executed = tiedPlayers[0];
      } else {
        tie = true;
      }
    }

    if (executed) {
      const target = this.players.find(p => p.id === executed);
      if (target) {
        target.alive = false;
        this.graveyard.push(target);
        this.log.push(`⚰️ ${target.name} was lynched! They were a ${ROLES[target.role.toUpperCase()]?.name}`);
      }
    } else {
      this.log.push(`🤷 Vote was tied - no one dies`);
    }

    this.transitionTo(PHASES.VOTE_RESULTS, 3);
  }

  // === Win Condition ===
  
  checkWin() {
    const alive = this.players.filter(p => p.alive);
    const aliveWolves = alive.filter(p => p.role === 'werewolf');
    const aliveTown = alive.filter(p => p.role !== 'werewolf');
    
    // Wolves win if they equal/exceed town
    if (aliveWolves.length >= aliveTown.length && aliveWolves.length > 0) {
      this.winner = 'wolves';
      this.log.push(`🐺 WOLVES WIN! The town has fallen.`);
      this.transitionTo(PHASES.ENDED);
      return 'wolves';
    }
    
    // Town wins if all wolves are dead
    if (aliveWolves.length === 0) {
      this.winner = 'town';
      this.log.push(`🏘️ TOWN WINS! All wolves have been eliminated.`);
      this.transitionTo(PHASES.ENDED);
      return 'town';
    }
    
    return null;
  }

  advancePhase() {
    if (this.checkWin()) return;
    
    switch (this.phase) {
      case PHASES.ROLE_REVEAL:
        this.transitionTo(PHASES.NIGHT, 30);
        break;
      case PHASES.NIGHT:
        this.resolveNight();
        break;
      case PHASES.NIGHT_RESULTS:
        this.dayNumber++;
        this.transitionTo(PHASES.DAY_DISCUSS, 60);
        break;
      case PHASES.DAY_DISCUSS:
        this.transitionTo(PHASES.DAY_VOTE, 30);
        break;
      case PHASES.DAY_VOTE:
        this.resolveVote();
        break;
      case PHASES.VOTE_RESULTS:
        if (!this.checkWin()) {
          this.transitionTo(PHASES.NIGHT, 30);
        }
        break;
    }
  }

  // === Public State (sent to all players) ===
  
  publicState() {
    return {
      roomId: this.roomId,
      phase: this.phase,
      dayNumber: this.dayNumber,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        alive: p.alive,
        isHost: p.isHost,
        connected: p.connected !== false,
        hasVoted: this.phase === PHASES.DAY_VOTE ? p.vote !== null : null,
        voteCount: this.phase === PHASES.VOTE_RESULTS || this.phase === PHASES.ENDED
          ? this.votes[id => id === p.id].filter(v => v === p.id).length
          : null,
      })),
      votes: this.phase === PHASES.VOTE_RESULTS || this.phase === PHASES.ENDED ? this.votes : null,
      log: this.log.slice(-20),
      roleDeck: this.phase === PHASES.LOBBY ? this.roleDeck : null,
      winner: this.winner,
      timeRemaining: this.phaseDuration 
        ? Math.max(0, Math.ceil((this.phaseStartTime + this.phaseDuration - Date.now()) / 1000))
        : null,
    };
  }

  // === Private State (sent to individual player) ===
  
  privateState(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    
    const state = {
      myRole: player.role,
      myTeam: ROLES[player.role?.toUpperCase()]?.team,
      teammates: [],
      inspectResult: null,
    };
    
    // Wolves know other wolves
    if (player.role === 'werewolf') {
      state.teammates = this.players
        .filter(p => p.alive && p.role === 'werewolf' && p.id !== playerId)
        .map(p => ({ id: p.id, name: p.name }));
    }
    
    return state;
  }
}