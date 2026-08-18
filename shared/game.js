// Wolvesville-style Werewolf Game Engine
// Supports: multiple roles, night order, abilities (witch, guard, cupid, hunter, etc.)

import { ROLES, TEAMS, rolesForPlayerCount } from './roles.js';

const PHASES = {
  LOBBY: 'lobby',
  NIGHT_INTRO: 'night_intro',
  NIGHT: 'night',
  NIGHT_RESULTS: 'night_results',
  DAY_DISCUSS: 'day_discuss',
  DAY_VOTE: 'day_vote',
  DAY_RESULTS: 'day_results',
  ENDED: 'ended',
};

function shuffle(arr, seed) {
  // Deterministic shuffle with seed for fairness
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class WerewolfGame {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = []; // { id, name, role, team, alive, protected, shielded, loves, hasActed, nightUsed, vote }
    this.phase = PHASES.LOBBY;
    this.day = 0;
    this.night = 0;
    this.votes = {};
    this.nightActions = {};
    this.winner = null;
    this.log = [];
    this.settings = {
      dayTime: 60,
      nightTime: 30,
      voteTime: 30,
      rolesCustom: null,
    };
    this.lastKilled = null;
    this.lovers = []; // [id1, id2]
    this.gameStartedAt = Date.now();
    this.phaseEndsAt = null;
  }

  addPlayer(id, name) {
    if (this.phase !== PHASES.LOBBY) return { ok: false, error: 'Game đã bắt đầu' };
    if (this.players.find((p) => p.id === id)) return { ok: false, error: 'Đã trong phòng' };
    if (this.players.length >= 16) return { ok: false, error: 'Phòng đầy (tối đa 16)' };
    this.players.push({
      id, name, role: null, team: null,
      alive: true, protected: false, shielded: false,
      hasActed: false, nightUsed: {}, vote: null,
      witchHealUsed: false, witchKillUsed: false, lastProtected: null,
    });
    this.log.push(`👋 ${name} đã vào phòng`);
    return { ok: true };
  }

  removePlayer(id) {
    const p = this.players.find((x) => x.id === id);
    if (!p) return;
    this.players = this.players.filter((x) => x.id !== id);
    this.log.push(`🚪 ${p.name} đã rời phòng`);
  }

  start(customRoles) {
    if (this.phase !== PHASES.LOBBY) return { ok: false, error: 'Đã bắt đầu' };
    if (this.players.length < 3) return { ok: false, error: 'Cần ít nhất 3 người' };
    const roles = customRoles || rolesForPlayerCount(this.players.length);
    if (roles.length !== this.players.length) {
      return { ok: false, error: `Số vai (${roles.length}) ≠ số người (${this.players.length})` };
    }
    const shuffled = shuffle(roles, String(Date.now()));
    this.players.forEach((p, i) => {
      const role = shuffled[i];
      p.role = role;
      p.team = ROLES[role].team;
    });
    this.day = 1;
    this.night = 1;
    this.phase = PHASES.NIGHT_INTRO;
    this.log.push(`🎬 Game bắt đầu!`);
    this.log.push(`🌙 Đêm ${this.night} - Ai là sói?`);
    return { ok: true, assignments: this.players.map((p) => ({ id: p.id, role: p.role, team: p.team })) };
  }

  alivePlayers() {
    return this.players.filter((p) => p.alive);
  }

  // === NIGHT ACTIONS ===

  // Sort roles by nightOrder, return list of alive players whose role's nightOrder > 0
  nightActingPlayers() {
    return this.alivePlayers()
      .filter((p) => ROLES[p.role]?.nightOrder > 0)
      .filter((p) => !p.hasActed)
      .sort((a, b) => ROLES[a.role].nightOrder - ROLES[b.role].nightOrder);
  }

  submitNightAction(playerId, targetId, ability) {
    if (this.phase !== PHASES.NIGHT) return { ok: false, error: 'Không trong đêm' };
    const player = this.players.find((p) => p.id === playerId);
    if (!player || !player.alive) return { ok: false, error: 'Không hợp lệ' };
    if (player.hasActed) return { ok: false, error: 'Đã hành động' };
    if (!targetId) {
      // Skip action
      player.hasActed = true;
      this.log.push(`⏭️ ${player.name} bỏ qua`);
      return { ok: true };
    }

    switch (player.role) {
      case 'werewolf':
      case 'alpha_wolf':
      case 'lone_wolf':
        this.recordKill(playerId, targetId, 'wolf', playerId);
        break;
      case 'vampire':
        this.recordKill(playerId, targetId, 'vampire', playerId);
        break;
      case 'seer':
        this.nightActions[playerId] = { type: 'inspect', targetId };
        this.log.push(`🔮 ${player.name} đang điều tra...`);
        break;
      case 'guard':
        if (player.lastProtected === targetId) {
          return { ok: false, error: 'Không thể bảo vệ cùng người 2 đêm liên tiếp' };
        }
        this.nightActions[playerId] = { type: 'protect', targetId };
        this.log.push(`🛡️ ${player.name} đang bảo vệ...`);
        break;
      case 'witch':
        if (ability === 'heal' && !player.witchHealUsed) {
          const victim = this.players.find((p) => p.id === targetId);
          if (victim?.protected) return { ok: false, error: 'Không thể cứu người đã được bảo vệ' };
          player.witchHealUsed = true;
          this.nightActions[playerId] = { type: 'heal', targetId };
          this.log.push(`🧪 ${player.name} dùng nước cứu`);
        } else if (ability === 'kill' && !player.witchKillUsed) {
          player.witchKillUsed = true;
          this.recordKill(playerId, targetId, 'witch', playerId);
        }
        break;
      case 'cupid':
        if (this.night === 1) {
          this.nightActions[playerId] = { type: 'love', targetIds: Array.isArray(targetId) ? targetId : [targetId] };
          this.log.push(`💘 ${player.name} ghép đôi`);
        }
        break;
      case 'priest':
      case 'spellcaster':
        this.nightActions[playerId] = { type: 'shield', targetId };
        this.log.push(`✨ ${player.name} phong ấm`);
        break;
      case 'detective':
        this.nightActions[playerId] = { type: 'detective_inspect', targetId };
        break;
      case 'cultist':
        this.nightActions[playerId] = { type: 'convert', targetId };
        break;
      case 'arsonist':
        if (ability === 'douse') {
          this.nightActions[playerId] = { type: 'douse', targetId };
        }
        break;
    }
    player.hasActed = true;
    return { ok: true };
  }

  recordKill(killerId, targetId, cause, voterId) {
    this.nightActions[killerId] = { type: 'kill', targetId, cause };
  }

  resolveNight() {
    // Reset protections
    this.players.forEach((p) => {
      p.protected = false;
      p.shielded = false;
    });

    // Shield (Priest/Spellcaster) first - persists for the night
    Object.values(this.nightActions).forEach((act) => {
      if (act.type === 'shield') {
        const t = this.players.find((p) => p.id === act.targetId);
        if (t) t.shielded = true;
      }
    });

    // Apply all kills, respecting protections/shields
    const wolfKills = [];
    const witchKills = [];
    const vampireKills = [];

    Object.values(this.nightActions).forEach((act) => {
      if (act.type === 'kill') {
        const target = this.players.find((p) => p.id === act.targetId);
        if (!target) return;
        if (act.cause === 'wolf') wolfKills.push(act.targetId);
        else if (act.cause === 'witch') witchKills.push(act.targetId);
        else if (act.cause === 'vampire') vampireKills.push(act.targetId);
      }
    });

    // Wolves kill - apply protect/shield
    wolfKills.forEach((tid) => {
      const t = this.players.find((p) => p.id === tid);
      if (!t || t.shielded) return;
      const protectedBy = Object.values(this.nightActions).find((a) => a.type === 'protect' && a.targetId === tid);
      if (!protectedBy) {
        t.alive = false;
        this.log.push(`💀 ${t.name} đã bị sói giết chết`);
      } else {
        this.log.push(`🛡️ ${t.name} được bảo vệ`);
        const guard = this.players.find((p) => p.id === Object.keys(this.nightActions).find((k) => this.nightActions[k] === protectedBy));
        if (guard) guard.lastProtected = tid;
      }
    });

    // Witch heal
    Object.values(this.nightActions).forEach((act) => {
      if (act.type === 'heal') {
        const t = this.players.find((p) => p.id === act.targetId);
        if (t && !t.alive) {
          t.alive = true;
          this.log.push(`🧪 ${t.name} được cứu sống`);
        }
      }
    });

    // Witch kill (separate)
    witchKills.forEach((tid) => {
      const t = this.players.find((p) => p.id === tid);
      if (t && t.alive && !t.shielded) {
        t.alive = false;
        this.log.push(`☠️ ${t.name} chết vì nước độc phù thủy`);
      }
    });

    // Cupid love (first night only)
    if (this.night === 1) {
      const loveAct = Object.values(this.nightActions).find((a) => a.type === 'love');
      if (loveAct && loveAct.targetIds && loveAct.targetIds.length === 2) {
        this.lovers = loveAct.targetIds;
        const [a, b] = this.lovers;
        const pa = this.players.find((p) => p.id === a);
        const pb = this.players.find((p) => p.id === b);
        if (pa && pb) {
          pa.loves = pb.id;
          pb.loves = pa.id;
          this.log.push(`💕 ${pa.name} ❤️ ${pb.name} trở thành cặp đôi`);
        }
      }
    }

    // Cultist conversion
    Object.values(this.nightActions).forEach((act) => {
      if (act.type === 'convert') {
        const t = this.players.find((p) => p.id === act.targetId);
        if (t && t.alive && !t.shielded && ROLES[t.role]?.team !== 'cultist') {
          this.log.push(`👤 ${t.name} đã bị chuyển hóa sang Tà giáo`);
          // For simplicity, we keep the original role but mark their win condition
          t.team = 'cultist';
        }
      }
    });

    // Lovers: if one dies, the other dies too
    if (this.lovers.length === 2) {
      const [a, b] = this.lovers;
      const pa = this.players.find((p) => p.id === a);
      const pb = this.players.find((p) => p.id === b);
      if (pa && pb && (!pa.alive || !pb.alive)) {
        if (pa.alive) { pa.alive = false; this.log.push(`💔 ${pa.name} chết vì trái tim tan vỡ`); }
        if (pb.alive) { pb.alive = false; this.log.push(`💔 ${pb.name} chết vì trái tim tan vỡ`); }
      }
    }

    // Reset for next night
    this.players.forEach((p) => { p.hasActed = false; });
    this.nightActions = {};
  }

  inspectResult(playerId) {
    const act = this.nightActions[playerId];
    if (!act || act.type !== 'inspect') return null;
    const target = this.players.find((p) => p.id === act.targetId);
    if (!target) return null;
    const team = target.team;
    return {
      name: target.name,
      isWolf: team === 'werewolf' || team === 'vampire',
    };
  }

  // === DAY VOTING ===
  castVote(voterId, targetId) {
    if (this.phase !== PHASES.DAY_VOTE) return { ok: false };
    const voter = this.players.find((p) => p.id === voterId);
    if (!voter || !voter.alive) return { ok: false };
    voter.vote = targetId;
    if (targetId) {
      this.votes[targetId] = (this.votes[targetId] || 0) + 1;
    }
    return { ok: true, count: this.countVotes() };
  }

  countVotes() {
    const tally = {};
    this.alivePlayers().forEach((p) => {
      if (p.vote) tally[p.vote] = (tally[p.vote] || 0) + 1;
    });
    return tally;
  }

  resolveVotes() {
    const tally = this.countVotes();
    const entries = Object.entries(tally);
    if (entries.length === 0) return null;
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    if (sorted.length > 1 && sorted[1][1] === sorted[0][1]) return null;
    return { lynchedId: sorted[0][0], votes: sorted[0][1], tie: false };
  }

  // === WIN CONDITIONS ===
  checkWinner() {
    const alive = this.alivePlayers();
    const wolves = alive.filter((p) => p.team === 'werewolf').length;
    const vampires = alive.filter((p) => p.team === 'vampire').length;
    const cultists = alive.filter((p) => p.team === 'cultist').length;
    const tanners = alive.filter((p) => p.role === 'tanner');
    const villagers = alive.filter((p) => p.team === 'villager').length;
    const troubadour = alive.filter((p) => p.role === 'troubadour');
    const loversAlive = this.lovers.length === 2 && this.lovers.every((lid) => alive.find((p) => p.id === lid));

    // Troubadour
    if (troubadour.length === 1 && alive.length === 1) {
      this.winner = 'troubadour';
      this.log.push(`🎵 Troubadour thắng một mình!`);
      return true;
    }

    // Tanners: if lynched during day, they win (checked at vote resolution)
    // Lovers only: if 2 alive are lovers
    if (loversAlive && alive.length === 2) {
      this.winner = 'lovers';
      this.log.push(`💕 Cặp đôi thắng cuộc!`);
      return true;
    }

    // Werewolf wins
    if (wolves > 0 && wolves >= villagers + cultists) {
      this.winner = 'werewolf';
      this.log.push(`🐺 Ma sói thắng!`);
      return true;
    }

    // Vampire wins
    if (vampires > 0 && vampires >= villagers) {
      this.winner = 'vampire';
      this.log.push(`🧛 Ma cà rồng thắng!`);
      return true;
    }

    // Cultist wins
    if (cultists > 0 && cultists >= villagers && wolves === 0) {
      this.winner = 'cultist';
      this.log.push(`👤 Tà giáo thắng!`);
      return true;
    }

    // All threats gone - villagers win
    if (wolves === 0 && vampires === 0 && cultists === 0 && tanners.length === 0) {
      this.winner = 'villager';
      this.log.push(`🌟 Dân làng thắng!`);
      return true;
    }

    return false;
  }

  checkTannerWin(lynchedId) {
    const t = this.players.find((p) => p.id === lynchedId);
    if (t && t.role === 'tanner') {
      this.winner = 'tanner';
      this.log.push(`🎭 Người thuộc da thắng! (đã bị treo cổ)`);
      return true;
    }
    return false;
  }

  // === PHASE TRANSITIONS ===
  nextPhase() {
    if (this.phase === PHASES.NIGHT_INTRO) {
      this.phase = PHASES.NIGHT;
      this.log.push(`🌙 Đêm ${this.night} - Hành động`);
      this.players.forEach((p) => { p.hasActed = false; });
      return;
    }
    if (this.phase === PHASES.NIGHT) {
      this.resolveNight();
      this.phase = PHASES.NIGHT_RESULTS;
      this.log.push(`☀️ Sáng ${this.day} - Ai đã chết?`);
      return;
    }
    if (this.phase === PHASES.NIGHT_RESULTS) {
      this.phase = PHASES.DAY_DISCUSS;
      this.log.push(`💬 Bàn luận, vote treo cổ`);
      return;
    }
    if (this.phase === PHASES.DAY_DISCUSS) {
      this.phase = PHASES.DAY_VOTE;
      this.votes = {};
      this.players.forEach((p) => { p.vote = null; });
      this.log.push(`🗳️ Bắt đầu vote`);
      return;
    }
    if (this.phase === PHASES.DAY_VOTE) {
      const result = this.resolveVotes();
      if (result) {
        const target = this.players.find((p) => p.id === result.lynchedId);
        if (target && target.alive) {
          target.alive = false;
          this.log.push(`⚰️ ${target.name} bị treo cổ`);
          if (this.checkTannerWin(target.id)) {
            this.phase = PHASES.ENDED;
            return;
          }
        }
      } else {
        this.log.push(`🤝 Hòa - không ai bị treo cổ`);
      }
      if (this.checkWinner()) {
        this.phase = PHASES.ENDED;
        return;
      }
      this.day++;
      this.night = this.day;
      this.players.forEach((p) => { p.vote = null; });
      this.phase = PHASES.NIGHT_INTRO;
      this.log.push(`🌙 Đêm ${this.night} - Hành động`);
      return;
    }
    if (this.phase === PHASES.LOBBY) {
      return;
    }
  }

  // === PUBLIC STATE ===
  publicState() {
    return {
      roomId: this.roomId,
      hostId: this.hostId,
      phase: this.phase,
      day: this.day,
      night: this.night,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        alive: p.alive,
        role: this.phase === PHASES.ENDED ? p.role : null,
        team: this.phase === PHASES.ENDED ? p.team : null,
        loves: !!p.loves,
      })),
      nightActionCount: this.alivePlayers().filter((p) => p.hasActed).length,
      nightActingTotal: this.nightActingPlayers().length,
      voteCount: this.alivePlayers().filter((p) => p.vote).length,
      voteTotal: this.alivePlayers().length,
      winner: this.winner,
      lovers: this.lovers,
      log: this.log.slice(-20),
      settings: this.settings,
    };
  }

  // === PRIVATE STATE (player view) ===
  privateState(playerId) {
    const me = this.players.find((p) => p.id === playerId);
    if (!me) return null;
    const inspectResult = this.inspectResult(playerId);
    return {
      myRole: me.role,
      myTeam: me.team,
      witchHealUsed: me.witchHealUsed,
      witchKillUsed: me.witchKillUsed,
      inspectResult,
      myLoves: me.loves,
    };
  }
}

export { PHASES, ROLES, TEAMS, rolesForPlayerCount };