import React from 'react';
import { BookOpen, Shield } from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-[#141414] border border-[#222222] rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-3">
          <BookOpen className="w-4 h-4" />
          <span>Justin Sandercoe Methodology</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-100 tracking-tight m-0">
          The Architecture of Deliberate Practice
        </h2>
        <p className="text-sm text-neutral-400 mt-3 leading-relaxed max-w-2xl">
          Progress in guitar comes from structure, discipline, and tactile honesty. Focused daily repetitions beat sporadic long sessions every time.
        </p>

        {/* Justin Quote Callout */}
        <div className="mt-5 p-4 rounded-lg bg-[#0d0d0d] border border-[#222222]">
          <p className="text-sm italic text-neutral-300 m-0">
            “If you can’t play it cleanly and slowly with a metronome, you can’t play it fast. Practice doesn't make perfect—practice makes permanent.”
          </p>
          <span className="block text-xs font-mono text-neutral-500 mt-2">
            — Justin Sandercoe (JustinGuitar)
          </span>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Principle 1 */}
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 space-y-2">
          <div className="w-7 h-7 rounded bg-[#1c1c1c] text-neutral-300 flex items-center justify-center border border-[#2a2a2a] font-mono font-medium text-xs">
            01
          </div>
          <h3 className="text-base font-medium text-neutral-100 m-0">
            Daily Short Sessions &gt; Weekend Marathons
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed m-0">
            Fine motor neuromuscular pathways consolidate during sleep. A focused <strong className="text-neutral-200">20–30 minute session every single day</strong> dramatically outperforms an unfocused 3-hour weekend cram session.
          </p>
        </div>

        {/* Principle 2 */}
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 space-y-2">
          <div className="w-7 h-7 rounded bg-[#1c1c1c] text-neutral-300 flex items-center justify-center border border-[#2a2a2a] font-mono font-medium text-xs">
            02
          </div>
          <h3 className="text-base font-medium text-neutral-100 m-0">
            Target Weaknesses at the Edge of Ability
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed m-0">
            Playing what you already know is fun; deliberate practice means identifying the exact finger snag, the slow barre transition, or the muted string, and isolating it until effortless.
          </p>
        </div>

        {/* Principle 3 */}
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 space-y-2">
          <div className="w-7 h-7 rounded bg-[#1c1c1c] text-neutral-300 flex items-center justify-center border border-[#2a2a2a] font-mono font-medium text-xs">
            03
          </div>
          <h3 className="text-base font-medium text-neutral-100 m-0">
            The 4 Pillars of a Routine
          </h3>
          <div className="text-xs text-neutral-400 leading-relaxed space-y-1.5 pt-1">
            <div>• <strong className="text-neutral-200">Finger Mechanics:</strong> Spider walks, hammer-ons, wrist posture.</div>
            <div>• <strong className="text-neutral-200">Chord Transitions:</strong> 1-minute changes with recorded counts.</div>
            <div>• <strong className="text-neutral-200">Rhythm Clock:</strong> Internalizing tempo with metronome clicks.</div>
            <div>• <strong className="text-neutral-200">Repertoire:</strong> Full songs played without stopping for errors.</div>
          </div>
        </div>

        {/* Principle 4 */}
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 space-y-2">
          <div className="w-7 h-7 rounded bg-[#1c1c1c] text-neutral-300 flex items-center justify-center border border-[#2a2a2a] font-mono font-medium text-xs">
            04
          </div>
          <h3 className="text-base font-medium text-neutral-100 m-0">
            The One-Minute Changes Benchmark
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed m-0">
            Set the timer to 60 seconds and count clean chord changes between two shapes (e.g. D to A). Reaching <strong className="text-neutral-200">60 clean changes per minute</strong> signals automatic procedural muscle memory.
          </p>
        </div>
      </div>

      {/* Local Storage & Privacy */}
      <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 text-xs text-neutral-400 space-y-2">
        <div className="flex items-center gap-2 font-mono font-medium text-neutral-200 text-xs">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Local Device Storage • 100% Private</span>
        </div>
        <p className="leading-relaxed m-0 text-neutral-400">
          All routines, exercises, history logs, and metronome calibrations reside solely in your browser storage. No accounts, tracking, or cloud lock-in. You can backup or export your data at any time via Settings.
        </p>
      </div>
    </div>
  );
};
