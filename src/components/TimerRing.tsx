import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Plus, Minus, FastForward } from 'lucide-react';

interface TimerRingProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onMarkDoneFullTime: () => void;
  onSkip?: () => void;
  onAdjustSeconds?: (deltaSecs: number) => void;
}

export const TimerRing: React.FC<TimerRingProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  onPlay,
  onPause,
  onReset,
  onMarkDoneFullTime,
  onSkip,
  onAdjustSeconds,
}) => {
  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Circular SVG progress calculation
  const size = 230;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;

  // Fraction completed: 0 at start, 1 when timer runs out
  const fractionElapsed = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - fractionElapsed);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Circle container */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-4xl md:text-5xl font-mono font-extrabold tracking-tight text-white mb-1">
            {formatTime(secondsLeft)}
          </div>
          <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            {isRunning ? 'Session Active' : secondsLeft === 0 ? 'Completed!' : 'Ready'}
          </div>

          {/* Quick Play/Pause big button in center or right beneath */}
          <button
            type="button"
            onClick={isRunning ? onPause : onPlay}
            className={`mt-3 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/20'
            }`}
            title={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick +/- 1 minute adjustments & Reset / Skip */}
      <div className="flex items-center gap-2 mt-4 text-xs">
        {onAdjustSeconds && (
          <>
            <button
              type="button"
              onClick={() => onAdjustSeconds(-60)}
              className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 transition-colors"
              title="Subtract 1 minute"
            >
              <Minus className="w-3.5 h-3.5" /> 1m
            </button>
            <button
              type="button"
              onClick={() => onAdjustSeconds(60)}
              className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 transition-colors"
              title="Add 1 minute"
            >
              <Plus className="w-3.5 h-3.5" /> 1m
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onReset}
          className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1 transition-colors"
          title="Reset timer to scheduled time"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1 transition-colors"
            title="Skip to next item"
          >
            <FastForward className="w-3.5 h-3.5" /> Skip
          </button>
        )}
      </div>

      {/* "Mark as done – log full scheduled time" (Directly from JustinGuitar PA feature 2.2) */}
      <button
        type="button"
        onClick={onMarkDoneFullTime}
        className="mt-4 w-full max-w-xs py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-emerald-950/40 hover:text-emerald-400 border border-slate-700 hover:border-emerald-600/60 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>Mark as done – log full scheduled time</span>
      </button>
    </div>
  );
};
