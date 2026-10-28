import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Plus, Minus, Music } from 'lucide-react';
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
    setIsPlaying((prev) => !prev);
  };

  const updateBpm = (newBpm: number) => {
    const clamped = Math.min(260, Math.max(30, Math.round(newBpm)));
    setBpm(clamped);
    if (onBpmChange) onBpmChange(clamped);
  };

  const handleTap = () => {
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-sm uppercase tracking-wider text-slate-300">Metronome</span>
          {activeItemName && (
            <span className="text-xs text-slate-500 hidden sm:inline truncate max-w-[150px]">
              • {activeItemName}
            </span>
          )}
        </div>
        
        {/* Time signature pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['2/4', '3/4', '4/4', '6/8'] as TimeSignature[]).map((sig) => (
            <button
              key={sig}
              type="button"
              onClick={() => setTimeSig(sig)}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                timeSig === sig
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              } transition-colors`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>

      {/* Main BPM Display & Quick Modifiers */}
      <div className="my-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateBpm(bpm - 5)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
            title="Minus 5 BPM"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => updateBpm(bpm - 1)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            title="Minus 1 BPM"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-black text-amber-400 tracking-tight flex items-baseline justify-center gap-1">
            <span>{bpm}</span>
            <span className="text-xs font-semibold uppercase text-slate-400">BPM</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {bpm < 60 ? 'Largo' : bpm < 76 ? 'Adagio' : bpm < 108 ? 'Andante' : bpm < 120 ? 'Moderato' : bpm < 168 ? 'Allegro' : 'Presto'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateBpm(bpm + 1)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            title="Plus 1 BPM"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateBpm(bpm + 5)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
            title="Plus 5 BPM"
          >
            +5
          </button>
        </div>
      </div>

      {/* BPM Slider */}
      <div className="px-1 mb-4">
        <input
          type="range"
          min="30"
          max="260"
          value={bpm}
          onChange={(e) => updateBpm(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>30</span>
          <span>120</span>
          <span>260</span>
        </div>
      </div>

      {/* Beat Visualizer Dots */}
      <div className="flex justify-center items-center gap-2 my-3">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => {
          const isActive = isPlaying && currentBeat === i;
          const isAccent = i === 0;

          return (
            <div
              key={i}
              className={`transition-all duration-75 rounded-full ${
                isActive
                  ? isAccent
                    ? 'w-4 h-4 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-125'
                    : 'w-3.5 h-3.5 bg-amber-500/90 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110'
                  : 'w-2.5 h-2.5 bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md transition-all ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start Metronome</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleTap}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 border border-slate-700"
          title="Tap along with rhythm to detect tempo"
        >
          Tap Tempo
        </button>

        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2.5 rounded-xl border ${
            isMuted
              ? 'bg-rose-950/60 border-rose-800 text-rose-400'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200'
          } transition-colors`}
          title={isMuted ? 'Unmute' : 'Mute clicks (visual only)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
