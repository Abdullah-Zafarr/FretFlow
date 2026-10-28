import React from 'react';
import { BookOpen, Shield } from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-2">
          <BookOpen className="w-4 h-4" /> JustinGuitar Practice Assistant Philosophy
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Deliberate Practice: How Real Guitar Progress Happens
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          The difference between players who get stuck for years and players who make steady, audible progress is not talent—it is <strong>how</strong> they practice.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Principle 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 font-bold text-sm">
            01
          </div>
          <h3 className="text-base font-bold text-white">Short Daily Sessions &gt; Weekend Marathons</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your muscle memory and subconscious brain consolidate fine motor movements during rest and sleep. Practicing <strong>20–30 minutes every day</strong> produces far greater gains than 3 hours once a week.
          </p>
        </div>

        {/* Principle 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 font-bold text-sm">
            02
          </div>
          <h3 className="text-base font-bold text-white">Practice Weaknesses, Not Just What's Fun</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Playing what you already do well feels great, but practicing means working right at the edge of your ability—where you make mistakes, isolate the snag, and slow it down until it feels natural.
          </p>
        </div>

        {/* Principle 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold text-sm">
            03
          </div>
          <h3 className="text-base font-bold text-white">The 4 Pillars of a Balanced Routine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A complete routine balances:
            <br />• <strong>Technique</strong> (Spider drill, finger independence)
            <br />• <strong>Chords</strong> (One-minute changes, barre chord clarity)
            <br />• <strong>Rhythm &amp; Timing</strong> (Metronome, dynamic strumming)
            <br />• <strong>Repertoire</strong> (Playing real songs all the way through)
          </p>
        </div>

        {/* Principle 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 font-bold text-sm">
            04
          </div>
          <h3 className="text-base font-bold text-white">Use a Metronome to Lock In Your Groove</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Justin constantly stresses internalizing the "1" beat. Use the embedded metronome to test your transitions at gradual speeds (e.g. 60 BPM → 80 BPM) before speeding up.
          </p>
        </div>
      </div>

      {/* Local Storage & Privacy */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Local &amp; Private Storage</span>
        </div>
        <p>
          All your routines, exercise library, practice history logs, and metronome BPM settings are stored directly in your browser's local storage. You can export a backup JSON at any time using the <strong>Backup / Restore</strong> button in the navigation bar.
        </p>
      </div>
    </div>
  );
};
