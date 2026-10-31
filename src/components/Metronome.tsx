import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Plus, Minus, Activity } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MetronomeProps {
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
  activeItemName?: string;
}

type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export const Metronome: React.FC<MetronomeProps> = ({
  initialBpm = 80,
  onBpmChange,
  activeItemName,
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeSig, setTimeSig] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync initialBpm if it changes from outside
  useEffect(() => {
    if (initialBpm) {
      setBpm(initialBpm);
    }
  }, [initialBpm]);

  // Tap tempo tracking
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<number | null>(null);

  const beatsPerMeasure = timeSig === '2/4' ? 2 : timeSig === '3/4' ? 3 : timeSig === '4/4' ? 4 : 6;

  // Web Audio lookahead scheduler
  const nextNoteTimeRef = useRef<number>(0);
  const beatRef = useRef<number>(0);
  const timerWorkerRef = useRef<number | null>(null);

  const scheduleNextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
    beatRef.current = (beatRef.current + 1) % beatsPerMeasure;
  }, [bpm, beatsPerMeasure]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerWorkerRef.current !== null) {
        window.clearInterval(timerWorkerRef.current);
        timerWorkerRef.current = null;
      }
      setCurrentBeat(0);
      return;
    }

    soundEngine.unlockAudio();
    beatRef.current = 0;
    setCurrentBeat(0);
    nextNoteTimeRef.current = soundEngine.getCurrentTime();

    const lookaheadMs = 25;
    const scheduleAheadTime = 0.1;

    timerWorkerRef.current = window.setInterval(() => {
      const curTime = soundEngine.getCurrentTime();
      while (nextNoteTimeRef.current < curTime + scheduleAheadTime) {
        const isAccent = beatRef.current === 0;
        if (!isMuted) {
          soundEngine.playTick(isAccent, nextNoteTimeRef.current);
        }
        
        // Sync UI flash
        const scheduledBeat = beatRef.current;
        const timeDiffMs = Math.max(0, (nextNoteTimeRef.current - curTime) * 1000);
        window.setTimeout(() => {
          setCurrentBeat(scheduledBeat);
        }, timeDiffMs);

        scheduleNextNote();
      }
    }, lookaheadMs);

    return () => {
      if (timerWorkerRef.current !== null) {
        window.clearInterval(timerWorkerRef.current);
        timerWorkerRef.current = null;
      }
    };
  }, [isPlaying, isMuted, scheduleNextNote]);

  const togglePlay = () => {
    soundEngine.playMechanicalClick('stomp');
    setIsPlaying((prev) => !prev);
  };

  const updateBpm = (newBpm: number) => {
    const clamped = Math.min(260, Math.max(30, Math.round(newBpm)));
    setBpm(clamped);
    if (onBpmChange) onBpmChange(clamped);
  };

  const handleTap = () => {
    soundEngine.playMechanicalClick('rotary');
    const now = Date.now();
    if (tapTimeoutRef.current) {
      window.clearTimeout(tapTimeoutRef.current);
    }

    tapTimesRef.current.push(now);

    // Keep last 4 taps
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        updateBpm(calculatedBpm);
      }
    }

    // Reset tap detection after 2 seconds of inactivity
    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimesRef.current = [];
    }, 2000);
  };

  return (
    <div className="bg-[#181512] border border-[#383025] rounded-xl p-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.5)] text-[#f0ebe1] select-none relative">
      <div className="absolute top-2.5 left-2.5 screw-head" />
      <div className="absolute top-2.5 right-2.5 screw-head" />

      {/* Top Header & Time Signature */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d251d] sm:px-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#d6cdbe]">
            ANALOG TEMPO ENGINE
          </span>
          {activeItemName && (
            <span className="text-[11px] font-mono text-[#8c8070] hidden sm:inline truncate max-w-[150px]">
              [{activeItemName}]
            </span>
          )}
        </div>
        
        {/* Time Signature Selector */}
        <div className="flex items-center gap-1 bg-[#120f0d] p-1 rounded border border-[#2e261e]">
          {(['2/4', '3/4', '4/4', '6/8'] as TimeSignature[]).map((sig) => (
            <button
              key={sig}
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setTimeSig(sig);
              }}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded cursor-pointer ${
                timeSig === sig
                  ? 'bg-amber-500 text-[#141210] shadow-sm'
                  : 'text-[#8c8070] hover:text-[#f0ebe1]'
              } transition-colors`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>

      {/* Main BPM Readout & Analog Stepper Controls */}
      <div className="my-4 flex items-center justify-between gap-4 sm:px-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm - 5);
            }}
            className="w-9 h-8 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#3d3326] text-[#c9bea8] flex items-center justify-center font-mono font-bold text-xs cursor-pointer active:translate-y-0.5"
            title="Step back 5 BPM"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm - 1);
            }}
            className="w-9 h-8 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#3d3326] text-[#c9bea8] flex items-center justify-center cursor-pointer active:translate-y-0.5"
            title="Step back 1 BPM"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Central Readout */}
        <div className="text-center">
          <div className="text-4xl font-mono font-black text-amber-400 tracking-tight flex items-baseline justify-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>{bpm}</span>
            <span className="text-xs font-mono font-bold uppercase text-[#8c8070]">BPM</span>
          </div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#a39786] font-semibold mt-0.5">
            {bpm < 60 ? 'Largo (Broad)' : bpm < 76 ? 'Adagio (Slow)' : bpm < 108 ? 'Andante (Walking)' : bpm < 120 ? 'Moderato' : bpm < 168 ? 'Allegro (Lively)' : 'Presto (Rapid)'}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm + 1);
            }}
            className="w-9 h-8 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#3d3326] text-[#c9bea8] flex items-center justify-center cursor-pointer active:translate-y-0.5"
            title="Advance 1 BPM"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm + 5);
            }}
            className="w-9 h-8 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#3d3326] text-[#c9bea8] flex items-center justify-center font-mono font-bold text-xs cursor-pointer active:translate-y-0.5"
            title="Advance 5 BPM"
          >
            +5
          </button>
        </div>
      </div>

      {/* Tactile Slider Track */}
      <div className="px-3 mb-4">
        <input
          type="range"
          min="30"
          max="260"
          value={bpm}
          onChange={(e) => updateBpm(Number(e.target.value))}
          className="w-full h-2 bg-[#120f0d] rounded appearance-none cursor-pointer accent-amber-500 border border-[#2e261e]"
        />
        <div className="flex justify-between text-[10px] font-mono text-[#7d7262] mt-1 font-semibold">
          <span>30 LARGO</span>
          <span>120 MODERATO</span>
          <span>260 PRESTO</span>
        </div>
      </div>

      {/* Illuminated Beat Lamps (Analog VU style) */}
      <div className="flex justify-center items-center gap-3 my-3 py-2 bg-[#120f0d] rounded-lg border border-[#29221b] max-w-sm mx-auto shadow-inner">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => {
          const isActive = isPlaying && currentBeat === i;
          const isAccent = i === 0;

          return (
            <div
              key={i}
              className={`transition-all duration-75 rounded-full flex items-center justify-center ${
                isActive
                  ? isAccent
                    ? 'w-5 h-5 bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-300 shadow-[0_0_14px_rgba(245,158,11,1)]'
                    : 'w-4 h-4 bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  : 'w-3 h-3 bg-[#241e17] border border-[#382f23]'
              }`}
            >
              {isAccent && <span className="text-[8px] font-mono font-black text-[#141210]">1</span>}
            </div>
          );
        })}
      </div>

      {/* Control Hardware Footswitches */}
      <div className="flex items-center gap-2 pt-2 sm:px-3">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex-1 py-2.5 px-4 rounded-lg font-mono font-bold flex items-center justify-center gap-2 text-xs shadow-md transition-all cursor-pointer active:translate-y-0.5 ${
            isPlaying
              ? 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-500'
              : 'bg-amber-500 hover:bg-amber-400 text-[#141210] border border-amber-300'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>HALT METRONOME</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>ENGAGE METRONOME</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleTap}
          className="px-4 py-2.5 rounded-lg bg-[#241e17] hover:bg-[#2e261d] text-[#d6cdbe] font-mono font-bold text-xs uppercase tracking-wider transition-colors active:translate-y-0.5 border border-[#3d3326] cursor-pointer"
          title="Tap in tempo to calibrate BPM"
        >
          TAP TEMPO
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playMechanicalClick('toggle');
            setIsMuted(!isMuted);
          }}
          className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-[#291717] border-[#4a2626] text-[#e07b7b]'
              : 'bg-[#241e17] hover:bg-[#2e261d] border-[#3d3326] text-[#998d7d] hover:text-[#f0ebe1]'
          }`}
          title={isMuted ? 'Clicks Muted (Optical Only)' : 'Audible Clicks Engaged'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
