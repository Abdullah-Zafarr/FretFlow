import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Plus, Minus } from 'lucide-react';
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

    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimesRef.current = [];
    }, 2000);
  };

  return (
    <div className="bg-[#181818] border border-[#262626] rounded-md p-4 text-[#e5e5e5] select-none space-y-3">
      {/* Top Header & Time Signature */}
      <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white">Metronome</span>
          {activeItemName && (
            <span className="text-xs text-[#737373] hidden sm:inline truncate max-w-[160px]">
              • {activeItemName}
            </span>
          )}
        </div>
        
        {/* Time Signature Buttons */}
        <div className="flex items-center gap-1">
          {(['2/4', '3/4', '4/4', '6/8'] as TimeSignature[]).map((sig) => (
            <button
              key={sig}
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setTimeSig(sig);
              }}
              className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer transition-colors ${
                timeSig === sig
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#222222] text-[#888888] hover:text-white'
              }`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>

      {/* BPM Readout & Stepper Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm - 5);
            }}
            className="w-8 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-white flex items-center justify-center font-mono text-[11px] cursor-pointer"
            title="-5 BPM"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm - 1);
            }}
            className="w-7 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-white flex items-center justify-center cursor-pointer"
            title="-1 BPM"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>

        {/* Central BPM */}
        <div className="text-center">
          <div className="text-3xl font-mono font-medium text-white tracking-tight flex items-baseline justify-center gap-1">
            <span>{bpm}</span>
            <span className="text-xs font-mono text-[#737373]">BPM</span>
          </div>
          <div className="text-[10px] font-mono text-[#888888]">
            {bpm < 60 ? 'Largo' : bpm < 76 ? 'Adagio' : bpm < 108 ? 'Andante' : bpm < 120 ? 'Moderato' : bpm < 168 ? 'Allegro' : 'Presto'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm + 1);
            }}
            className="w-7 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-white flex items-center justify-center cursor-pointer"
            title="+1 BPM"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('rotary');
              updateBpm(bpm + 5);
            }}
            className="w-8 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-white flex items-center justify-center font-mono text-[11px] cursor-pointer"
            title="+5 BPM"
          >
            +5
          </button>
        </div>
      </div>

      {/* Minimal Slider */}
      <input
        type="range"
        min="30"
        max="260"
        value={bpm}
        onChange={(e) => updateBpm(Number(e.target.value))}
        className="w-full h-1 bg-[#262626] rounded appearance-none cursor-pointer accent-amber-400"
      />

      {/* Minimal Beat Indicator Dots */}
      <div className="flex justify-center items-center gap-2 py-1">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => {
          const isActive = isPlaying && currentBeat === i;
          const isAccent = i === 0;

          return (
            <div
              key={i}
              className={`transition-colors duration-75 rounded-full ${
                isActive
                  ? isAccent
                    ? 'w-2.5 h-2.5 bg-amber-400'
                    : 'w-2 h-2 bg-white'
                  : 'w-2 h-2 bg-[#2a2a2a]'
              }`}
            />
          );
        })}
      </div>

      {/* Minimal Controls */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-white hover:bg-[#e5e5e5] text-black'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleTap}
          className="px-3 py-1.5 rounded bg-[#222222] hover:bg-[#2c2c2c] text-[#d4d4d4] text-xs font-medium transition-colors cursor-pointer"
          title="Tap in tempo"
        >
          Tap
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playMechanicalClick('toggle');
            setIsMuted(!isMuted);
          }}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isMuted
              ? 'bg-[#291414] text-[#e06666]'
              : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#888888] hover:text-white'
          }`}
          title={isMuted ? 'Muted' : 'Audible'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
