import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, FastForward, Rewind } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { formatTime, parseTimeToSeconds } from '../utils/time';

interface TimerRingProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onMarkDoneFullTime: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onAdjustSeconds?: (deltaSecs: number) => void;
  onSetSeconds?: (secs: number) => void;
}

export const TimerRing: React.FC<TimerRingProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  onPlay,
  onPause,
  onReset,
  onMarkDoneFullTime,
  onPrev,
  onSkip,
  hasPrev,
  hasNext,
  onAdjustSeconds,
  onSetSeconds,
}) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    if (isRunning) {
      onPause();
    }
    setEditInputValue(formatTime(secondsLeft));
    setIsEditingTime(true);
  };

  useEffect(() => {
    if (isEditingTime) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTime]);

  const handleCommitEdit = () => {
    if (!isEditingTime) return;
    const parsed = parseTimeToSeconds(editInputValue);
    if (parsed !== null && parsed >= 0) {
      soundEngine.playMechanicalClick('toggle');
      onSetSeconds?.(parsed);
    }
    setIsEditingTime(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTime(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Minimal circular progress geometry
  const size = 175;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;

  // Fraction completed: 0 at start, 1 when timer runs out
  const fractionElapsed = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - fractionElapsed);

  return (
    <div className="flex flex-col items-center justify-center p-1 select-none">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {isEditingTime ? (
            <div className="relative flex flex-col items-center z-20">
              <input
                ref={inputRef}
                type="text"
                value={editInputValue}
                onChange={(e) => setEditInputValue(e.target.value)}
                onBlur={handleCommitEdit}
                onKeyDown={handleKeyDown}
                placeholder="03:00"
                className="w-28 text-center font-mono text-2xl font-semibold text-white bg-[#141414] border-2 border-amber-500 rounded px-1 py-0.5 outline-none shadow-md shadow-amber-500/20"
              />
              <span className="text-[9px] font-mono text-amber-400 mt-0.5 bg-[#1c1c1c] px-1.5 py-0.2 rounded border border-[#2e2e2e]">
                ↵ save • esc cancel
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEditing}
              className="group/time relative flex items-center justify-center cursor-pointer rounded-lg px-2 py-0.5 transition-all hover:bg-white/5 active:scale-95"
              title="Click on time to edit (e.g. 5:00, 2:30, 45s, 10)"
            >
              <span className="text-3xl font-mono font-medium tracking-tight text-white group-hover/time:text-amber-400 transition-colors">
                {formatTime(secondsLeft)}
              </span>
              <span className="opacity-0 group-hover/time:opacity-100 transition-opacity absolute -top-3.5 right-0 text-[9px] font-mono text-amber-400 bg-[#222222] border border-[#333333] px-1.5 py-0.2 rounded shadow">
                edit ✎
              </span>
            </button>
          )}

          <div className="text-[10px] font-mono text-[#888888]">
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
            className={`mt-2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-400 hover:bg-amber-300 text-black'
                : 'bg-white hover:bg-[#e5e5e5] text-black'
            }`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Stepper Controls */}
      <div className="flex items-center gap-1 mt-2.5 text-xs flex-wrap justify-center">
        {onAdjustSeconds && (
          <>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('rotary');
                onAdjustSeconds(-60);
              }}
              className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white font-mono text-[10px] cursor-pointer"
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
              className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white font-mono text-[10px] cursor-pointer"
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
          className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#888888] hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset</span>
        </button>

        {onPrev && (
          <button
            type="button"
            disabled={hasPrev === false}
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              onPrev();
            }}
            className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#888888] hover:text-white text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous exercise"
          >
            <Rewind className="w-2.5 h-2.5" />
            <span>Prev</span>
          </button>
        )}

        {onSkip && (
          <button
            type="button"
            disabled={hasNext === false}
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              onSkip();
            }}
            className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#888888] hover:text-white text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next exercise"
          >
            <FastForward className="w-2.5 h-2.5" />
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
        className="mt-2.5 w-full max-w-xs py-1.5 px-3 rounded-md bg-[#161616] hover:bg-[#202020] border border-[#292929] hover:border-[#383838] text-[#a3a3a3] hover:text-white text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Mark as Done (Full Time)</span>
      </button>
    </div>
  );
};
