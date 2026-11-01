// Web Audio API Sound Synthesizer & Metronome Engine

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const win = typeof window !== 'undefined' ? window : (globalThis as unknown as Window);
      const AudioCtx = win.AudioContext || (win as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('AudioContext unavailable in current environment');
      }
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public unlockAudio() {
    if (this.isUnlocked) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.001);
      this.isUnlocked = true;
    } catch {
      // AudioContext may still be locked until explicit gesture
    }
  }

  public playTick(accent: boolean = false, time?: number) {
    try {
      const ctx = this.getContext();
      const playTime = time ?? ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch: high clean ping on beat 1, crisper woodblock style on rest
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(accent ? 1320 : 880, playTime);
      osc.frequency.exponentialRampToValueAtTime(accent ? 660 : 440, playTime + 0.03);

      gain.gain.setValueAtTime(accent ? 0.9 : 0.5, playTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, playTime + (accent ? 0.06 : 0.035));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(playTime);
      osc.stop(playTime + (accent ? 0.06 : 0.04));
    } catch (e) {
      console.warn('Audio tick failed', e);
    }
  }

  public playAlarm(tone: 'chime' | 'bell' | 'beep' = 'chime') {
    try {
      const ctx = this.getContext();
      const startTime = ctx.currentTime;

      if (tone === 'beep') {
        [0, 0.15, 0.3].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, startTime + offset);
          gain.gain.setValueAtTime(0.4, startTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime + offset);
          osc.stop(startTime + offset + 0.09);
        });
        return;
      }

      if (tone === 'bell') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, startTime);
        gain.gain.setValueAtTime(0.7, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.2);
        return;
      }

      // Default 'chime' - guitar/celeste harmonious arpeggio: C5, E5, G5, C6
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = startTime + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.4, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 1.0);
      });
    } catch (e) {
      console.warn('Alarm failed', e);
    }
  }

  /**
   * Synthesize tactile analog switch / pedal mechanical clicks
   * Gives physical tangible feedback when triggering hardware controls.
   */
  public playMechanicalClick(type: 'toggle' | 'stomp' | 'rotary' = 'toggle') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (type === 'stomp') {
        // Heavy 3PDT true-bypass foot-switch clunk
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        return;
      }

      if (type === 'rotary') {
        // Soft analog detent tick for rotary dials
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
        return;
      }

      // Default 'toggle' - crisp vintage toggle switch contact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.022);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // AudioContext silenced
    }
  }

  public getCurrentTime(): number {
    return this.getContext().currentTime;
  }
}

export const soundEngine = new AudioEngine();
