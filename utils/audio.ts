class SoundManager {
  private context: AudioContext | null = null;

  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  playTone(freq: number, type: OscillatorType, duration: number) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked until user interaction
    }
  }

  playClick() {
    this.playTone(800, 'sine', 0.05);
  }

  playWin() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2), i * 100);
    });
  }

  playLoss() {
    const ctx = this.getContext();
    [300, 200, 100].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.3), i * 150);
    });
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.2);
  }
}

export const audio = new SoundManager();
export const sfx = audio; // Alias for backwards compatibility
