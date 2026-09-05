/**
 * Web Audio API synthesizer for tactile UI sounds:
 * Wheel ticking, spin swoosh, jackpot fanfare, coin drop chime.
 * Works offline and across all browsers without external audio dependencies.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Tactile tick sound for wheel passing pegs
  playWheelTick(pitchMultiplier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 * pitchMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {
      // Audio context policy safe ignore
    }
  }

  // Coin drop / win chime
  playCoinChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.38);
      });
    } catch (e) {}
  }

  // Jackpot Mega Celebration Fanfare
  playJackpotFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chords = [
        { f: [523.25, 659.25, 783.99], t: 0 },
        { f: [587.33, 739.99, 880.00], t: 0.15 },
        { f: [659.25, 830.61, 987.77], t: 0.3 },
        { f: [1046.5, 1318.5, 1567.98], t: 0.5 },
      ];

      chords.forEach(({ f, t }) => {
        f.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + t);

          gain.gain.setValueAtTime(0.08, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.55);
        });
      });
    } catch (e) {}
  }

  // Physical shake rattle sound effect
  playShakeRattle(intensity = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const count = Math.min(8, Math.max(3, Math.round(5 * intensity)));
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        const baseFreq = 200 + Math.random() * 400;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime + i * 0.035);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + i * 0.035 + 0.03);

        gain.gain.setValueAtTime(0.08 * intensity, ctx.currentTime + i * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.035 + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.035);
        osc.stop(ctx.currentTime + i * 0.035 + 0.035);
      }
    } catch (e) {}
  }

  // Reward chest unlock chime
  playRewardUnlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const frequencies = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.45);
      });
    } catch (e) {}
  }

  // Realistic Instagram camera shutter click sound
  playCameraShutter() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // First quick mechanical click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.03);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.04);

      // Second shutter curtain close click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.045);
      osc2.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.045);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.045);
      osc2.stop(ctx.currentTime + 0.095);
    } catch (e) {}
  }
}

export const soundSynth = new SoundSynthesizer();
