import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Plus, Minus, FastForward } from 'lucide-react';
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

  // Circular gauge geometry
  const size = 240;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;

  // Fraction completed: 0 at start, 1 when timer runs out
  const fractionElapsed = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - fractionElapsed);

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      {/* Analog Gauge Bezel Enclosure */}
      <div className="relative flex items-center justify-center p-3 rounded-full bg-[#171411] border-2 border-[#383026] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_6px_20px_rgba(0,0,0,0.5)]">
        {/* Four Hardware Screws at 45 degree positions */}
        <div className="absolute top-2 left-2 screw-head" />
        <div className="absolute top-2 right-2 screw-head" />
        <div className="absolute bottom-2 left-2 screw-head" />
        <div className="absolute bottom-2 right-2 screw-head" />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Inner Meter Chamber */}
          <circle
            cx={center}
            cy={center}
            r={radius + 4}
            fill="#120f0d"
          />

          {/* Background Recessed Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#27211b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Warm Filament Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={secondsLeft === 0 ? '#10b981' : isRunning ? '#f59e0b' : '#b45309'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Readout & Controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="text-4xl md:text-5xl font-mono font-black tracking-tight text-[#f7f3eb] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {formatTime(secondsLeft)}
          </div>

          <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold mt-1 text-[#a69a89]">
            {isRunning ? (
              <span className="text-amber-400">● RUNNING</span>
            ) : secondsLeft === 0 ? (
              <span className="text-emerald-400">● TARGET MET</span>
            ) : (
              <span>○ STANDBY</span>
            )}
          </div>

          {/* Stompbox Footswitch Trigger */}
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
            className={`mt-3 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer stomp-button shadow-[0_5px_0_#0d0c0a,0_8px_16px_rgba(0,0,0,0.6)] ${
              isRunning
                ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-[#141210] border-2 border-[#fcd34d]'
                : 'bg-gradient-to-b from-[#383129] to-[#221e19] text-[#f2eee7] border-2 border-[#54483c] hover:border-amber-500/60'
            }`}
            title={isRunning ? 'Halt Session (Footswitch)' : 'Engage Session (Footswitch)'}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Analog Stepper Controls (+/- 1m, Reset, Skip) */}
      <div className="flex items-center gap-2 mt-4 text-xs">
        {onAdjustSeconds && (
          <>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('rotary');
                onAdjustSeconds(-60);
              }}
              className="p-1.5 px-3 rounded bg-[#221d17] hover:bg-[#2e2720] border border-[#3d3326] text-[#c9bea5] font-mono font-bold flex items-center gap-1 cursor-pointer shadow-sm active:translate-y-0.5"
              title="Step back 1 minute"
            >
              <Minus className="w-3.5 h-3.5" /> 1m
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('rotary');
                onAdjustSeconds(60);
              }}
              className="p-1.5 px-3 rounded bg-[#221d17] hover:bg-[#2e2720] border border-[#3d3326] text-[#c9bea5] font-mono font-bold flex items-center gap-1 cursor-pointer shadow-sm active:translate-y-0.5"
              title="Add 1 minute"
            >
              <Plus className="w-3.5 h-3.5" /> 1m
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.playMechanicalClick('toggle');
            onReset();
          }}
          className="p-1.5 px-3 rounded bg-[#221d17] hover:bg-[#2e2720] border border-[#3d3326] text-[#8e8272] hover:text-[#f0eae0] font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:translate-y-0.5"
          title="Reset timer to target duration"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              onSkip();
            }}
            className="p-1.5 px-3 rounded bg-[#221d17] hover:bg-[#2e2720] border border-[#3d3326] text-[#8e8272] hover:text-[#f0eae0] font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:translate-y-0.5"
            title="Advance to next exercise"
          >
            <FastForward className="w-3.5 h-3.5" /> Advance
          </button>
        )}
      </div>

      {/* Log Full Scheduled Time Stamped Pushbutton */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playMechanicalClick('stomp');
          onMarkDoneFullTime();
        }}
        className="mt-4 w-full max-w-xs py-2.5 px-4 rounded-lg bg-[#1f1b16] hover:bg-[#2a241e] border border-[#42372a] hover:border-emerald-600/60 text-[#c7bea8] hover:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-0.5 group"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
        <span>Log Full Scheduled Time</span>
      </button>
    </div>
  );
};
