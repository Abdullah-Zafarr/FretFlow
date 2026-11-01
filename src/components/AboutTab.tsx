import React from 'react';
import { BookOpen, Shield, Flame, Target, Compass, Sparkles } from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Studio Masterclass Header */}
      <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-6 md:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-3 left-3 screw-head" />
        <div className="absolute top-3 right-3 screw-head" />

        <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold tracking-[0.2em] text-amber-500 mb-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>JUSTIN SANDERCOE METHODOLOGY & PHILOSOPHY</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-[#fdfaf3] tracking-tight m-0">
          The Architecture of Deliberate Practice
        </h2>
        <p className="text-xs md:text-sm text-[#bcb1a1] mt-2.5 font-sans leading-relaxed max-w-2xl">
          The difference between players who remain plateaued for a decade and players who develop effortless musicality is not innate genius—it is the structure, discipline, and tactile honesty of daily practice.
        </p>

        {/* Vintage Justin Quote Callout */}
        <div className="mt-5 p-4 rounded-lg bg-[#141210] border border-[#332b21] shadow-inner">
          <p className="text-xs md:text-sm font-serif italic text-amber-300 m-0">
            “If you can’t play it cleanly and slowly with a metronome, you can’t play it fast. Practice doesn't make perfect—practice makes permanent.”
          </p>
          <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#7d7262] mt-1.5">
            — Justin Sandercoe (JustinGuitar)
          </span>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Principle 1 */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-sm space-y-2 relative">
          <div className="w-8 h-8 rounded bg-[#241e17] text-amber-400 flex items-center justify-center border border-[#443729] font-mono font-bold text-xs">
            01
          </div>
          <h3 className="text-base font-serif font-bold text-[#f7f3ec] m-0">
            Daily Short Sessions &gt; Weekend Marathons
          </h3>
          <p className="text-xs text-[#a39786] leading-relaxed font-sans m-0">
            Fine motor neuromuscular pathways consolidate during sleep and rest. A focused <strong>20–30 minute session every single day</strong> outperforms a chaotic 3-hour weekend cram session by an order of magnitude.
          </p>
        </div>

        {/* Principle 2 */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-sm space-y-2 relative">
          <div className="w-8 h-8 rounded bg-[#271d18] text-orange-400 flex items-center justify-center border border-[#4d2f23] font-mono font-bold text-xs">
            02
          </div>
          <h3 className="text-base font-serif font-bold text-[#f7f3ec] m-0">
            Target Weaknesses at the Edge of Ability
          </h3>
          <p className="text-xs text-[#a39786] leading-relaxed font-sans m-0">
            Playing what you already know is recreation; practicing means isolating the exact finger snag, the slow barre transition, or the buzzy string, and looping it until the obstacle dissolves.
          </p>
        </div>

        {/* Principle 3 */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-sm space-y-2 relative">
          <div className="w-8 h-8 rounded bg-[#18261d] text-emerald-400 flex items-center justify-center border border-[#264731] font-mono font-bold text-xs">
            03
          </div>
          <h3 className="text-base font-serif font-bold text-[#f7f3ec] m-0">
            The 4 Pillars of a Complete Routine
          </h3>
          <div className="text-xs text-[#a39786] leading-relaxed font-sans space-y-1">
            <div>• <strong className="text-[#f0ebe1]">Finger Mechanics:</strong> Spider walks, hammer-ons, wrist posture.</div>
            <div>• <strong className="text-[#f0ebe1]">Chord Transitions:</strong> 1-minute changes with recorded counts.</div>
            <div>• <strong className="text-[#f0ebe1]">Rhythm Clock:</strong> Internalizing beat 1 with metronome clicks.</div>
            <div>• <strong className="text-[#f0ebe1]">Repertoire:</strong> Full songs played without stopping for mistakes.</div>
          </div>
        </div>

        {/* Principle 4 */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-sm space-y-2 relative">
          <div className="w-8 h-8 rounded bg-[#1b2229] text-sky-400 flex items-center justify-center border border-[#2b3c4d] font-mono font-bold text-xs">
            04
          </div>
          <h3 className="text-base font-serif font-bold text-[#f7f3ec] m-0">
            The One-Minute Changes Benchmark
          </h3>
          <p className="text-xs text-[#a39786] leading-relaxed font-sans m-0">
            Set the timer to 60 seconds and count clean chord changes between two shapes (e.g. D to A). When you hit <strong>60 clean changes per minute</strong>, the shape has entered permanent procedural muscle memory.
          </p>
        </div>
      </div>

      {/* Local Storage & Analog Privacy Architecture */}
      <div className="bg-[#171411] border border-[#332c23] rounded-xl p-5 text-xs text-[#a39786] space-y-2 relative">
        <div className="flex items-center gap-2 font-mono font-bold text-[#f0ebe1] text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>LOCAL WORKBENCH SOVEREIGNTY • ZERO CLOUD LOCK-IN</span>
        </div>
        <p className="leading-relaxed font-sans m-0">
          All practice sequence presets, catalog drills, session history logs, and metronome calibrations reside solely on your local device. No surveillance, no accounts, and no data lock-in. You can download or restore your full workbench state as a single JSON file anytime via the Calibration panel.
        </p>
      </div>
    </div>
  );
};
