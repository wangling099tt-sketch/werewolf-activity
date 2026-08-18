// Bot AI - simulates other players when there aren't enough humans

const BOT_NAMES = [
  '🦊 Cáo Tinh', '🐺 Sói Hoang', '🦉 Cú Mèo', '🐻 Gấu Lớn',
  '🐅 Hổ Vằn', '🦅 Đại Bàng', '🦌 Nai Vàng', '🐢 Rùa Thông Thái',
  '🐸 Ếch Xanh', '🦁 Sư Tử', '🐲 Rồng Lửa', '🦄 Kỳ Lân',
];

let botCounter = 0;
function makeBot() {
  botCounter++;
  const idx = Math.floor(Math.random() * BOT_NAMES.length);
  const name = `${BOT_NAMES[idx]} ${botCounter}`;
  return {
    id: `bot-${Date.now()}-${botCounter}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    isBot: true,
  };
}

export class BotManager {
  constructor(game) {
    this.game = game;
    this.bots = new Map(); // botId -> { name, role, team, alive, ... }
  }

  fillTo(target) {
    const alive = this.game.alivePlayers().length;
    const need = target - alive;
    for (let i = 0; i < need; i++) {
      this.addBot();
    }
  }

  addBot() {
    const info = makeBot();
    const r = this.game.addPlayer(info.id, info.name);
    if (!r.ok) return null;
    this.bots.set(info.id, info);
    return info.id;
  }

  // Auto-play for all bots at current phase
  playAll() {
    const phase = this.game.phase;
    if (phase === 'night' || phase === 'night_intro') {
      this.playNightActions();
    } else if (phase === 'day_vote') {
      this.playVotes();
    } else if (phase === 'day_discuss') {
      // bots "discuss" by adding log entries occasionally
    }
  }

  playNightActions() {
    this.bots.forEach((_, botId) => {
      const bot = this.game.players.find((p) => p.id === botId);
      if (!bot || !bot.alive || bot.hasActed) return;
      const role = bot.role;
      const alive = this.game.alivePlayers().filter((p) => p.id !== botId);

      // Werewolves coordinate on same target
      if (role === 'werewolf' || role === 'alpha_wolf' || role === 'lone_wolf') {
        // Wolves try to kill non-wolves; coordinate with other wolves
        const allies = this.game.alivePlayers().filter((p) => p.team === 'werewolf');
        const recentTarget = this.lastWolfTarget;
        const candidates = alive.filter((p) => p.team !== 'werewolf');
        if (candidates.length === 0) return;
        const target = recentTarget && candidates.find((c) => c.id === recentTarget)
          ? recentTarget
          : candidates[Math.floor(Math.random() * candidates.length)].id;
        this.game.submitNightAction(botId, target, 'kill');
        this.lastWolfTarget = target;
      } else if (role === 'vampire') {
        const candidates = alive.filter((p) => p.team !== 'vampire');
        if (!candidates.length) return;
        const target = candidates[Math.floor(Math.random() * candidates.length)].id;
        this.game.submitNightAction(botId, target, 'kill');
      } else if (role === 'seer' || role === 'detective') {
        // Seer prioritizes suspicious or random
        const target = alive[Math.floor(Math.random() * alive.length)].id;
        this.game.submitNightAction(botId, target, role === 'seer' ? 'inspect' : 'detective_inspect');
      } else if (role === 'guard') {
        // Guard picks a non-protected target
        const candidates = alive.filter((p) => p.id !== bot.lastProtected);
        if (!candidates.length) {
          this.game.submitNightAction(botId, null);
          return;
        }
        const target = candidates[Math.floor(Math.random() * candidates.length)].id;
        this.game.submitNightAction(botId, target, 'protect');
      } else if (role === 'witch') {
        // 50% chance to use heal if someone died last night, else maybe kill
        if (!bot.witchHealUsed && Math.random() < 0.5) {
          // Heal a random non-protected
          const candidates = alive.filter((p) => !p.protected);
          if (candidates.length) {
            this.game.submitNightAction(botId, candidates[0].id, 'heal');
            return;
          }
        }
        if (!bot.witchKillUsed && Math.random() < 0.5) {
          const candidates = alive.filter((p) => p.team !== 'villager');
          const fallbacks = alive.filter((p) => p.id !== botId);
          const list = candidates.length ? candidates : fallbacks;
          if (list.length) {
            this.game.submitNightAction(botId, list[Math.floor(Math.random() * list.length)].id, 'kill');
            return;
          }
        }
        // Skip
        this.game.submitNightAction(botId, null);
      } else if (role === 'cupid' && this.game.night === 1) {
        // Pair 2 random players
        const pair = this.randomPair(alive.map((p) => p.id));
        this.game.submitNightAction(botId, pair[0], 'love');
        // Cupid's love action needs 2 ids, send second as a separate update
        // For simplicity, we'll store both
        const act = this.game.nightActions[botId];
        if (act) act.targetIds = pair;
      } else if (role === 'priest' || role === 'spellcaster') {
        const target = alive[Math.floor(Math.random() * alive.length)].id;
        this.game.submitNightAction(botId, target, 'shield');
      } else if (role === 'cultist') {
        const candidates = alive.filter((p) => p.team !== 'cultist');
        if (candidates.length) {
          this.game.submitNightAction(botId, candidates[Math.floor(Math.random() * candidates.length)].id, 'convert');
        } else {
          this.game.submitNightAction(botId, null);
        }
      } else if (role === 'arsonist') {
        const candidates = alive.filter((p) => p.id !== botId);
        if (candidates.length) {
          this.game.submitNightAction(botId, candidates[Math.floor(Math.random() * candidates.length)].id, 'douse');
        }
      } else {
        // No action
        this.game.submitNightAction(botId, null);
      }
    });
  }

  playVotes() {
    this.bots.forEach((_, botId) => {
      const bot = this.game.players.find((p) => p.id === botId);
      if (!bot || !bot.alive) return;
      const alive = this.game.alivePlayers().filter((p) => p.id !== botId);
      if (alive.length === 0) return;
      let target;
      if (bot.role === 'werewolf' || bot.team === 'werewolf') {
        // Wolves vote together
        const allies = this.game.alivePlayers().filter((p) => p.team === 'werewolf');
        const nonWolves = alive.filter((p) => p.team !== 'werewolf');
        if (!nonWolves.length) {
          this.game.castVote(botId, null);
          return;
        }
        const recentTarget = this.lastWolfVoteTarget;
        target = recentTarget && nonWolves.find((c) => c.id === recentTarget)
          ? recentTarget
          : nonWolves[Math.floor(Math.random() * nonWolves.length)].id;
        this.lastWolfVoteTarget = target;
      } else if (bot.role === 'tanner') {
        // Tanner votes randomly hoping to get lynched
        target = alive[Math.floor(Math.random() * alive.length)].id;
      } else {
        // Villagers might vote with majority or random
        const target_counts = {};
        this.game.alivePlayers().forEach((p) => {
          if (p.vote) target_counts[p.vote] = (target_counts[p.vote] || 0) + 1;
        });
        // 60% go with majority, 40% random
        if (Math.random() < 0.6) {
          const sorted = Object.entries(target_counts).sort((a, b) => b[1] - a[1]);
          if (sorted.length) {
            target = sorted[0][0];
          }
        }
        if (!target) target = alive[Math.floor(Math.random() * alive.length)].id;
      }
      this.game.castVote(botId, target);
    });
  }

  randomPair(ids) {
    if (ids.length < 2) return ids;
    const a = ids[Math.floor(Math.random() * ids.length)];
    let b = ids[Math.floor(Math.random() * ids.length)];
    while (b === a && ids.length > 1) {
      b = ids[Math.floor(Math.random() * ids.length)];
    }
    return [a, b];
  }

  // Bot randomly chats once per day phase
  chatOnce(lines) {
    const botIds = Array.from(this.bots.keys());
    if (!botIds.length) return;
    const botId = botIds[Math.floor(Math.random() * botIds.length)];
    const bot = this.game.players.find((p) => p.id === botId);
    if (!bot) return;
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.game.log.push(`💬 ${bot.name}: ${line}`);
  }
}