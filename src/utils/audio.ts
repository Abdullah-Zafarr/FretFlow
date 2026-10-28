// Web Audio API Sound Synthesizer & Metronome Engine

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
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

  public getCurrentTime(): number {
    return this.getContext().currentTime;
  }
}

export const soundEngine = new AudioEngine();
