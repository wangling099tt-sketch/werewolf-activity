// Cloudflare Workers-compatible game logic (no Node.js dependencies)

export class WerewolfGame {
  roomId: string;
  hostId: string;
  players: any[] = [];
  phase: string = 'LOBBY';
  dayNumber: number = 0;
  log: string[] = [];
  votes: Record<string, string> = {};
  nightActions: any = {};
  winner: string | null = null;
  roleDeck: any = {
    werewolf: 2, seer: 1, bodyguard: 1, villager: 4,
  };

  constructor(roomId: string, hostId: string) {
    this.roomId = roomId;
    this.hostId = hostId;
  }

  addPlayer(id: string, name: string, avatar: string = '') {
    const player = {
      id, name, avatar, role: null, alive: true,
      isHost: id === this.hostId, vote: null, hasActed: false,
    };
    this.players.push(player);
    this.log.push(`👋 ${name} joined`);
  }

  start(customDeck?: any) {
    if (this.players.length < 4) return { ok: false, error: 'Need 4 players' };
    const deck = customDeck || this.roleDeck;
    const totalRoles = Object.values(deck).reduce((a: number, b: any) => a + b, 0);
    if (totalRoles !== this.players.length) return { ok: false, error: 'Role count mismatch' };

    const roleList: string[] = [];
    for (const [role, count] of Object.entries(deck)) {
      for (let i = 0; i < (count as number); i++) roleList.push(role);
    }
    // Shuffle
    for (let i = roleList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roleList[i], roleList[j]] = [roleList[j], roleList[i]];
    }
    this.players.forEach((p, i) => p.role = roleList[i]);
    
    this.phase = 'ROLE_REVEAL';
    this.dayNumber = 1;
    this.log.push('🎬 Game started!');
    return { ok: true };
  }

  submitNightAction(playerId: string, targetId: string, ability: string) {
    const player = this.players.find(p => p.id === playerId);
    const target = this.players.find(p => p.id === targetId);
    if (!player || !target || !player.alive) return;
    
    if (player.role === 'werewolf') {
      if (!this.nightActions.wolves) this.nightActions.wolves = {};
      this.nightActions.wolves[playerId] = targetId;
      player.hasActed = true;
    } else if (player.role === 'seer') {
      player.hasActed = true;
    }
  }

  castVote(voterId: string, targetId: string) {
    const voter = this.players.find(p => p.id === voterId);
    if (!voter || !voter.alive) return;
    voter.vote = targetId;
    this.votes[voterId] = targetId;
  }

  checkWin(): string | null {
    const alive = this.players.filter(p => p.alive);
    const wolves = alive.filter(p => p.role === 'werewolf');
    if (wolves.length === 0) {
      this.winner = 'town';
      return 'town';
    }
    if (wolves.length >= alive.length - wolves.length) {
      this.winner = 'wolves';
      return 'wolves';
    }
    return null;
  }

  publicState() {
    return {
      roomId: this.roomId,
      phase: this.phase,
      dayNumber: this.dayNumber,
      players: this.players.map(p => ({
        id: p.id, name: p.name, avatar: p.avatar,
        alive: p.alive, isHost: p.isHost,
      })),
      log: this.log.slice(-20),
      votes: this.votes,
      winner: this.winner,
    };
  }
}