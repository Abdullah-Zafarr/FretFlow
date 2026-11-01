import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, FastForward } from 'lucide-react';
import { soundEngine } from '../utils/audio';

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

  // Minimal circular progress geometry
  const size = 220;
  const strokeWidth = 5;
  const center = size / 2;
  const radius = center - strokeWidth - 8;
  const circumference = 2 * Math.PI * radius;

  // Fraction completed: 0 at start, 1 when timer runs out
  const fractionElapsed = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - fractionElapsed);

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      {/* Minimal Timer Dial */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Subtle Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#202020"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Minimalist Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={secondsLeft === 0 ? '#10b981' : '#f59e0b'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Readout & Main Action */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="text-4xl sm:text-5xl font-mono font-medium tracking-tight text-white">
            {formatTime(secondsLeft)}
          </div>

          <div className="text-[11px] font-mono text-[#888888] mt-1">
            {isRunning ? (
              <span className="text-amber-400">active</span>
            ) : secondsLeft === 0 ? (
              <span className="text-emerald-400">completed</span>
            ) : (
              <span>ready</span>
            )}
          </div>

          {/* Minimalist Play / Pause Trigger */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('stomp');
              if (isRunning) {
                onPause();
              } else {
                onPlay();
              }
            }}
            className={`mt-3 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-400 hover:bg-amber-300 text-black'
                : 'bg-white hover:bg-[#e5e5e5] text-black'
            }`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Minimal Stepper Controls */}
      <div className="flex items-center gap-1.5 mt-3 text-xs">
        {onAdjustSeconds && (
          <>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('rotary');
                onAdjustSeconds(-60);
              }}
              className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white font-mono text-[11px] cursor-pointer"
              title="Subtract 1 minute"
            >
              -1m
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('rotary');
                onAdjustSeconds(60);
              }}
              className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white font-mono text-[11px] cursor-pointer"
              title="Add 1 minute"
            >
              +1m
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.playMechanicalClick('toggle');
            onReset();
          }}
          className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#888888] hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              onSkip();
            }}
            className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#888888] hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
            title="Next exercise"
          >
            <FastForward className="w-3 h-3" />
            <span>Next</span>
          </button>
        )}
      </div>

      {/* Mark as done button */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playMechanicalClick('stomp');
          onMarkDoneFullTime();
        }}
        className="mt-3.5 w-full max-w-xs py-2 px-3 rounded-md bg-[#161616] hover:bg-[#202020] border border-[#292929] hover:border-[#383838] text-[#a3a3a3] hover:text-white text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Mark as Done (Full Time)</span>
      </button>
    </div>
  );
};
