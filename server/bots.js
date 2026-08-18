// Bot AI for filling empty slots

export class BotManager {
  constructor(game) {
    this.game = game;
    this.bots = new Map();
    this.botCounter = 0;
  }

  addBot() {
    const botId = `bot_${Date.now()}_${++this.botCounter}`;
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 99);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${botId}`;
    
    const result = this.game.addPlayer(botId, `🤖 ${name}`, avatar);
    if (result.ok) {
      this.bots.set(botId, { id: botId, name, personality: 'random' });
    }
    return result;
  }

  playAll() {
    if (this.game.phase === 'NIGHT') {
      this.bots.forEach((bot, botId) => {
        const player = this.game.players.find(p => p.id === botId);
        if (!player || !player.alive || player.hasActed) return;
        
        const aliveTargets = this.game.players.filter(p => p.alive && p.id !== botId);
        if (aliveTargets.length === 0) return;
        
        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
        
        switch (player.role) {
          case 'werewolf':
            this.game.submitNightAction(botId, target.id, 'kill');
            break;
          case 'seer':
            this.game.submitNightAction(botId, target.id, 'inspect');
            break;
          case 'bodyguard':
            this.game.submitNightAction(botId, target.id, 'protect');
            break;
        }
      });
    } else if (this.game.phase === 'DAY_VOTE') {
      this.bots.forEach((bot, botId) => {
        const player = this.game.players.find(p => p.id === botId);
        if (!player || !player.alive || player.vote !== null) return;
        
        const aliveTargets = this.game.players.filter(p => p.alive && p.id !== botId);
        if (aliveTargets.length === 0) return;
        
        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
        this.game.castVote(botId, target.id);
      });
    }
  }

  chatOnce(lines) {
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.game.log.push(`💬 ${line}`);
  }
}