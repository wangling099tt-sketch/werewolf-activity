// Sound Manager - Web Audio API for game SFX
// No external assets needed - all generated procedurally

type SoundType = 
  | 'click'
  | 'reveal'
  | 'night'
  | 'day'
  | 'kill'
  | 'vote'
  | 'win'
  | 'lose'
  | 'tick'
  | 'death';

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.3;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(m: boolean) { this.muted = m; }
  isMuted() { return this.muted; }
  setVolume(v: number) { this.volume = Math.max(0, Math.min(1, v)); }

  play(type: SoundType) {
    if (this.muted) return;
    try {
      switch (type) {
        case 'click': return this.click();
        case 'reveal': return this.reveal();
        case 'night': return this.night();
        case 'day': return this.day();
        case 'kill': return this.kill();
        case 'vote': return this.vote();
        case 'win': return this.win();
        case 'lose': return this.lose();
        case 'tick': return this.tick();
        case 'death': return this.death();
      }
    } catch (e) {
      // Ignore audio errors
    }
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 1, delay = 0) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(this.volume * vol, ctx.currentTime + delay + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  private noise(duration: number, vol = 0.1) {
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * vol;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = this.volume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  click() {
    this.tone(800, 0.05, 'square', 0.3);
  }

  reveal() {
    this.tone(523, 0.1, 'triangle', 0.5); // C5
    setTimeout(() => this.tone(659, 0.1, 'triangle', 0.5), 100); // E5
    setTimeout(() => this.tone(784, 0.2, 'triangle', 0.5), 200); // G5
  }

  night() {
    this.tone(220, 0.3, 'sine', 0.4);
    setTimeout(() => this.tone(165, 0.5, 'sine', 0.4), 200);
  }

  day() {
    this.tone(440, 0.15, 'triangle', 0.4);
    setTimeout(() => this.tone(554, 0.15, 'triangle', 0.4), 150);
    setTimeout(() => this.tone(659, 0.2, 'triangle', 0.4), 300);
  }

  kill() {
    this.tone(150, 0.1, 'sawtooth', 0.5);
    this.noise(0.3, 0.15);
    setTimeout(() => this.tone(80, 0.5, 'sawtooth', 0.4), 100);
  }

  vote() {
    this.tone(660, 0.08, 'sine', 0.3);
    setTimeout(() => this.tone(880, 0.1, 'sine', 0.3), 80);
  }

  win() {
    // Triumphant fanfare
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 0.2, 'triangle', 0.5), i * 150);
    });
  }

  lose() {
    [440, 415, 392, 370].forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 0.3, 'sine', 0.4), i * 200);
    });
  }

  tick() {
    this.tone(1000, 0.05, 'square', 0.2);
  }

  death() {
    this.tone(400, 0.1, 'sawtooth', 0.4);
    setTimeout(() => this.tone(300, 0.15, 'sawtooth', 0.4), 100);
    setTimeout(() => this.tone(200, 0.3, 'sawtooth', 0.4), 250);
    this.noise(0.5, 0.1);
  }
}

export const sound = new SoundManager();
export type { SoundType };