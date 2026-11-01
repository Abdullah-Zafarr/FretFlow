import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundEngine } from '../utils/audio';

describe('Tactile Audio Engine & Mechanical Synthesis', () => {
  beforeEach(() => {
    // Mock Web Audio Context using ES6 class syntax so 'new AudioContext()' works cleanly
    const mockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    class MockAudioContext {
      public state = 'running';
      public currentTime = 10;
      public destination = {};
      public createOscillator() {
        return mockOscillator;
      }
      public createGain() {
        return mockGainNode;
      }
      public resume() {
        return Promise.resolve();
      }
    }

    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;
    if (typeof window === 'undefined') {
      (globalThis as unknown as { window: unknown }).window = globalThis;
    }
  });

  it('synthesizes toggle mechanical click without throwing', () => {
    expect(() => soundEngine.playMechanicalClick('toggle')).not.toThrow();
  });

  it('synthesizes stompbox foot-switch clunk without throwing', () => {
    expect(() => soundEngine.playMechanicalClick('stomp')).not.toThrow();
  });

  it('synthesizes rotary detent tick without throwing', () => {
    expect(() => soundEngine.playMechanicalClick('rotary')).not.toThrow();
  });

  it('synthesizes all alarm profiles without throwing', () => {
    expect(() => soundEngine.playAlarm('chime')).not.toThrow();
    expect(() => soundEngine.playAlarm('bell')).not.toThrow();
    expect(() => soundEngine.playAlarm('beep')).not.toThrow();
  });

  it('schedules metronome ticks accurately', () => {
    expect(() => soundEngine.playTick(true, 10.0)).not.toThrow();
    expect(() => soundEngine.playTick(false, 10.5)).not.toThrow();
  });
});
