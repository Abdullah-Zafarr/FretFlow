import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Video,
  Check,
  X,
  Play,
  RotateCw,
  ChevronRight,
  Maximize2,
  Minimize2,
  FastForward,
  Pause,
  Hash,
  Award,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import { ChordText } from './ChordText';
import { TimerRing } from './TimerRing';
import { Metronome } from './Metronome';
import { VideoAssistant } from './VideoAssistant';
import { soundEngine } from '../utils/audio';

export const PracticeTab: React.FC = () => {
  const {
    items,
    activeRoutine,
    activeItemId,
    activeItem,
    activeItemEntryMinutes,
    timerSeconds,
    timerTotalSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerSeconds,
    selectActiveItem,
    markItemDone,
    repeatActiveItem,
    nextItem,
    resetRoutineDoneStatus,
    updateItemNotes,
    updateItemThingsToRemember,
    updateItemBpm,
    saveItem,
    settings,
    updateSettings,
  } = usePractice();

  // Local UI states
  const [showMetronome, setShowMetronome] = useState<boolean>(false);
  const [editingNotes, setEditingNotes] = useState<boolean>(false);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [editingThings, setEditingThings] = useState<boolean>(false);
  const [thingsDraft, setThingsDraft] = useState<string>('');
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [scoreCountInput, setScoreCountInput] = useState<string>('');

  // Sync draft notes whenever active item changes
  useEffect(() => {
    if (activeItem) {
      setNotesDraft(activeItem.notes || '');
      setThingsDraft(activeItem.thingsToRemember || '');
      setEditingNotes(false);
      setEditingThings(false);
      setScoreCountInput('');
    }
  }, [activeItem]);

  // Handle ESC key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Trigger completion milestone when timer reaches 0
  useEffect(() => {
    if (timerSeconds === 0 && !isTimerRunning && activeItem) {
      setShowCompletionModal(true);
    }
  }, [timerSeconds, isTimerRunning, activeItem]);

  if (!activeRoutine) {
    return (
      <div className="p-12 text-center text-[#998e7f] bg-[#1a1714] border border-[#383129] rounded-xl max-w-xl mx-auto shadow-xl">
        <p className="text-lg font-serif font-bold text-[#f2efe9]">No routine currently mounted on the bench.</p>
        <p className="text-sm mt-2 text-[#998e7f]">Visit the <strong className="text-amber-500">Routines Rack</strong> to select or build your practice schedule.</p>
      </div>
    );
  }

  // Calculate total minutes of the routine
  const routineTotalMinutes = activeRoutine.entries.reduce((sum, entry) => {
    const item = items.find((i) => i.id === entry.itemId);
    return sum + (entry.minutes || item?.defaultMinutes || 0);
  }, 0);

  // Find active entry index
  const activeEntryIndex = activeRoutine.entries.findIndex((e) => e.itemId === activeItemId);
  const isDoneThisSession = activeRoutine.entries.find((e) => e.itemId === activeItemId)?.doneThisSession;

  const handleSaveNotes = () => {
    soundEngine.playMechanicalClick('toggle');
    if (activeItemId) {
      updateItemNotes(activeItemId, notesDraft);
    }
    setEditingNotes(false);
  };

  const handleSaveThings = () => {
    soundEngine.playMechanicalClick('toggle');
    if (activeItemId) {
      updateItemThingsToRemember(activeItemId, thingsDraft);
    }
    setEditingThings(false);
  };

  const handleAdjustTimer = (deltaSecs: number) => {
    setTimerSeconds(Math.max(0, timerSeconds + deltaSecs));
  };

  const handleModalDoneAndNext = () => {
    soundEngine.playMechanicalClick('stomp');
    setShowCompletionModal(false);
    if (activeItemId) {
      const score = scoreCountInput ? parseInt(scoreCountInput, 10) : undefined;
      markItemDone(activeItemId, true, undefined, isNaN(score as number) ? undefined : score);
      setScoreCountInput('');
    }
  };

  const handleModalRepeat = () => {
    soundEngine.playMechanicalClick('stomp');
    setShowCompletionModal(false);
    repeatActiveItem();
  };

  // Time format for focus mode
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Routine Chassis Header */}
      <div className="bg-[#1c1916] border border-[#383129] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4 relative">
        <div className="absolute top-2.5 left-2.5 screw-head hidden sm:block" />
        <div className="absolute top-2.5 right-2.5 screw-head hidden sm:block" />

        <div className="sm:pl-3">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-amber-500 mb-1">
            ACTIVE PRACTICE SEQUENCE
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#f7f3ec] tracking-tight m-0">
            {activeRoutine.name}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#a39786] font-mono">
            <span className="flex items-center gap-1.5 bg-[#141210] px-2.5 py-1 rounded border border-[#2f2922]">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              TOTAL {routineTotalMinutes} MINS
            </span>
            <span>•</span>
            <span>{activeRoutine.entries.length} Exercises Planned</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 sm:pr-3">
          {/* Always play with video assistant checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-[#c7bea8] bg-[#141210] px-3 py-2 rounded-lg border border-[#332c24] cursor-pointer hover:border-[#4d4236] transition-colors select-none">
            <input
              type="checkbox"
              checked={settings.alwaysPlayVideo}
              onChange={(e) => {
                soundEngine.playMechanicalClick('toggle');
                updateSettings({ alwaysPlayVideo: e.target.checked });
              }}
              className="rounded bg-[#221e19] border-[#443a2f] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Auto-mount Video Assistant</span>
          </label>

          {/* Reset Routine Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              resetRoutineDoneStatus();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#27211b] hover:bg-[#332c24] text-[#ede8df] text-xs font-bold font-mono transition-colors cursor-pointer border border-[#42372c] active:translate-y-0.5 shadow-sm"
            title="Reset routine completion marks for a fresh session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset Bench</span>
          </button>
        </div>
      </div>

      {/* Active Equipment Bay */}
      {activeItem ? (
        <div className="bg-[#1a1714] border-2 border-[#42372b] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Top Chassis Lip */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#5c503f] to-transparent mb-4" />

          {/* Item Title and Duration */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#2d2720]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded bg-[#2a241d] text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-[#4a3f32]">
                  {activeEntryIndex >= 0 ? activeEntryIndex + 1 : '•'}
                </span>
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-[#998d7d]">
                  {activeItem.category || 'PRACTICE DRILL'}
                </span>
                {isDoneThisSession && (
                  <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-[#122419] border border-[#1f472e] px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> LOGGED TODAY
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-[#f9f6f0] m-0">
                <ChordText text={activeItem.name} />
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-[#141210] text-amber-400 font-mono font-black text-sm px-3.5 py-1.5 rounded-lg border border-[#3d3326] shadow-inner">
                <Clock className="w-4 h-4 text-amber-500" />
                {activeItemEntryMinutes} MINS
              </span>

              {/* Fullscreen Focus Mode Button */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setIsFocusMode(true);
                }}
                className="p-2 rounded-lg bg-[#27211b] hover:bg-[#332c24] text-[#998d7d] hover:text-amber-400 border border-[#3d3326] transition-colors cursor-pointer"
                title="Engage Room Focus Mode (Large display for stand)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Grid: Timer + Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
            {/* Countdown Timer with Vintage Meter Gauge */}
            <div className="lg:col-span-5 flex justify-center">
              <TimerRing
                secondsLeft={timerSeconds}
                totalSeconds={timerTotalSeconds}
                isRunning={isTimerRunning}
                onPlay={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer}
                onMarkDoneFullTime={() => markItemDone(activeItem.id, true)}
                onSkip={nextItem}
                onAdjustSeconds={handleAdjustTimer}
              />
            </div>

            {/* Right side tools: Metronome Toggle & Practice Notes */}
            <div className="lg:col-span-7 space-y-4">
              {/* Tool Toggle Switches */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playMechanicalClick('toggle');
                    setShowMetronome(!showMetronome);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    showMetronome
                      ? 'bg-[#2b241c] text-amber-400 border-amber-600/50 shadow-inner'
                      : 'bg-[#141210] text-[#a39786] border-[#332c24] hover:border-[#4d4236]'
                  }`}
                >
                  {showMetronome ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-500" />}
                  <span>{showMetronome ? 'STOW METRONOME' : 'ENGAGE METRONOME'}</span>
                </button>

                {activeItem.videoUrl && (
                  <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold bg-[#211613] border border-[#42251e] text-[#e0897b]">
                    <Video className="w-3.5 h-3.5 text-rose-500" />
                    VIDEO INCLUDED
                  </span>
                )}
              </div>

              {/* Embedded Metronome Component */}
              {showMetronome && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-150">
                  <Metronome
                    initialBpm={activeItem.targetBpm || 80}
                    onBpmChange={(bpm) => updateItemBpm(activeItem.id, bpm)}
                    activeItemName={activeItem.name}
                  />
                </div>
              )}

              {/* Video Assistant */}
              {(settings.alwaysPlayVideo || activeItem.videoUrl) && (
                <div className="mt-4">
                  <VideoAssistant
                    videoUrl={activeItem.videoUrl}
                    onUpdateUrl={(url) =>
                      saveItem({
                        ...activeItem,
                        videoUrl: url,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                  />
                </div>
              )}

              {/* Console Scribble Tape: Personal Practice Notes */}
              <div className="bg-[#141210] border border-[#332c24] rounded-lg p-4 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#24201a]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8a7f70]">
                    PRACTICE LOG NOTES
                  </span>
                  {!editingNotes ? (
                    <button
                      type="button"
                      onClick={() => setEditingNotes(true)}
                      className="text-[#8a7f70] hover:text-amber-400 p-1 transition-colors cursor-pointer"
                      title="Edit Log Notes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                        title="Commit Notes"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotesDraft(activeItem.notes || '');
                          setEditingNotes(false);
                        }}
                        className="text-[#8a7f70] hover:text-[#f0eae0] p-1 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {editingNotes ? (
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={2}
                    className="w-full bg-[#1b1814] border border-[#443a2f] rounded p-2.5 text-xs text-[#f2eee7] font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Record tactile observations, pick angle, finger pressure..."
                  />
                ) : (
                  <p className="text-xs text-[#bcb1a1] leading-relaxed font-sans">
                    {activeItem.notes ? activeItem.notes : 'No personal observations logged yet. Click the pen to add.'}
                  </p>
                )}
              </div>

              {/* Key Practice Cues Card */}
              <div className="bg-[#211d17] border border-[#3f3527] rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#2d251a]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500">
                    KEY PRACTICE CUES (JUSTINGUITAR)
                  </span>
                  {!editingThings ? (
                    <button
                      type="button"
                      onClick={() => setEditingThings(true)}
                      className="text-amber-500/70 hover:text-amber-400 p-1 transition-colors cursor-pointer"
                      title="Edit Key Cues"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveThings}
                        className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                        title="Save Cues"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setThingsDraft(activeItem.thingsToRemember || '');
                          setEditingThings(false);
                        }}
                        className="text-[#8a7f70] hover:text-[#f0eae0] p-1 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {editingThings ? (
                  <textarea
                    value={thingsDraft}
                    onChange={(e) => setThingsDraft(e.target.value)}
                    rows={2}
                    className="w-full bg-[#171410] border border-[#443a2f] rounded p-2.5 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Keep thumb behind fretboard, fret close to wire..."
                  />
                ) : (
                  <p className="text-xs text-amber-200/90 leading-relaxed font-serif italic">
                    {activeItem.thingsToRemember ? (
                      `“${activeItem.thingsToRemember}”`
                    ) : (
                      <span className="text-[#7d7364] not-italic">No cues added.</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#1a1714] rounded-xl border border-[#383129] text-[#998e7f]">
          Select an exercise from the sequence below to place it on the workbench.
        </div>
      )}

      {/* Routine Items List (Below the active item) */}
      <div className="bg-[#1c1916] border border-[#383129] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2d2720] mb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d1c7b8] flex items-center gap-2 m-0">
            <span>SEQUENCE ROSTER</span>
            <span className="text-xs font-normal text-[#8c8172]">
              ({activeRoutine.entries.filter((e) => e.doneThisSession).length}/{activeRoutine.entries.length} Completed)
            </span>
          </h3>
          <span className="text-[11px] font-mono text-[#8c8172] hidden sm:inline">
            Direct access enabled • Out-of-order practice supported
          </span>
        </div>

        <div className="divide-y divide-[#26201a]">
          {activeRoutine.entries.map((entry, index) => {
            const item = items.find((i) => i.id === entry.itemId);
            if (!item) return null;

            const isSelected = activeItemId === item.id;
            const isDone = Boolean(entry.doneThisSession);
            const durationMins = entry.minutes || item.defaultMinutes;

            return (
              <div
                key={`${entry.itemId}-${index}`}
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  selectActiveItem(item.id);
                }}
                className={`p-3.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#26201a] border border-[#4d3f2f] shadow-inner'
                    : 'hover:bg-[#201c18]'
                }`}
              >
                {/* Left: Status Icon + Number + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playMechanicalClick('stomp');
                      markItemDone(item.id, true);
                    }}
                    className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs transition-transform active:scale-95 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow'
                        : isSelected
                        ? 'bg-amber-500 text-[#141210] font-black'
                        : 'bg-[#141210] text-[#7d7364] border border-[#332b22] hover:border-[#4d4033]'
                    }`}
                    title={isDone ? 'Completed! Click to re-log' : 'Click to stamp complete'}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                  </button>

                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#f0ebe1] truncate flex items-center gap-2">
                      <ChordText text={item.name} />
                      {isSelected && (
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#3d3224] text-amber-400 border border-amber-600/30">
                          ON BENCH
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-[#8c8070] truncate max-w-lg mt-0.5 font-sans">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration + Play button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-mono font-semibold text-[#a39786] bg-[#141210] px-2.5 py-1 rounded border border-[#2f2820]">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {durationMins} MINS
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playMechanicalClick('stomp');
                      selectActiveItem(item.id);
                      startTimer();
                    }}
                    className="p-1.5 rounded bg-[#27211b] hover:bg-amber-500 hover:text-[#141210] text-[#c7bea8] border border-[#3d3326] transition-colors cursor-pointer"
                    title="Engage this exercise directly"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Achieved Certificate Modal (Replaces cheap confetti) */}
      {showCompletionModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150">
          <div className="bg-[#1c1916] border-2 border-[#4f4233] rounded-xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 relative">
            <div className="absolute top-3 left-3 screw-head" />
            <div className="absolute top-3 right-3 screw-head" />

            <div className="w-14 h-14 mx-auto rounded-full bg-[#18271e] text-emerald-400 flex items-center justify-center border-2 border-emerald-600/50 shadow-inner">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-400 mb-1">
                DELIBERATE PRACTICE TARGET COMPLETED
              </div>
              <h3 className="text-xl font-serif font-black text-[#f7f3ec] m-0">
                {activeItem.name}
              </h3>
              <p className="text-xs text-[#a39786] mt-1 font-mono">
                Duration logged: <strong className="text-[#f0ebe1]">{activeItemEntryMinutes} minutes</strong>
              </p>
            </div>

            {/* Repetitions / One-Minute Changes Score Logger */}
            <div className="bg-[#141210] border border-[#332c24] rounded-lg p-3 text-left">
              <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#d1c7b8] mb-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                <span>One-Minute Changes / Repetition Count:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={scoreCountInput}
                  onChange={(e) => setScoreCountInput(e.target.value)}
                  placeholder="e.g. 52 chord changes"
                  className="flex-1 bg-[#1c1915] border border-[#443a2f] rounded px-3 py-1.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] font-mono text-[#8c8070]">changes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                type="button"
                onClick={handleModalDoneAndNext}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Stamp Complete & Next Exercise</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleModalRepeat}
                className="w-full py-2 px-4 rounded-lg bg-[#27211b] hover:bg-[#332c24] text-[#d6cdbe] font-mono font-bold text-xs flex items-center justify-center gap-2 border border-[#3f3528] cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                <span>Repeat Exercise (+{activeItemEntryMinutes} mins)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setShowCompletionModal(false);
                }}
                className="w-full py-1.5 text-xs font-mono text-[#8c8070] hover:text-[#d6cdbe] cursor-pointer"
              >
                Close dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Room Focus Mode */}
      {isFocusMode && activeItem && (
        <div className="fixed inset-0 z-50 bg-[#120f0d] flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2b241c] pb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-[#241e17] text-amber-400 font-mono font-bold text-sm flex items-center justify-center border border-[#443829]">
                {activeEntryIndex >= 0 ? activeEntryIndex + 1 : '•'}
              </span>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-500">
                  STAND FOCUS MODE • {activeRoutine.name}
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#f9f6f0] m-0">
                  <ChordText text={activeItem.name} />
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setIsFocusMode(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#221c16] hover:bg-[#2d251d] border border-[#3d3326] text-[#c9bea8] font-mono text-xs cursor-pointer"
              title="Exit Focus Mode (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Stand (Esc)</span>
            </button>
          </div>

          {/* Center Giant Countdown & Cues */}
          <div className="flex flex-col items-center justify-center text-center my-auto space-y-6">
            <div className="text-7xl sm:text-9xl md:text-[11rem] font-mono font-black tracking-tight text-[#fdfaf3] select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {formatTime(timerSeconds)}
            </div>

            {/* Things to Remember Cue Banner */}
            {activeItem.thingsToRemember && (
              <div className="max-w-2xl bg-[#1c1813] border border-[#3d3324] rounded-xl px-6 py-4 shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 block mb-1">
                  DELIBERATE FOCUS CUE
                </span>
                <p className="text-base sm:text-lg text-amber-200 font-serif italic leading-relaxed m-0">
                  “{activeItem.thingsToRemember}”
                </p>
              </div>
            )}

            {/* Metronome Bar in Focus Mode */}
            {showMetronome && (
              <div className="w-full max-w-md">
                <Metronome
                  initialBpm={activeItem.targetBpm || 80}
                  onBpmChange={(bpm) => updateItemBpm(activeItem.id, bpm)}
                  activeItemName={activeItem.name}
                />
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#2b241c]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('stomp');
                if (isTimerRunning) {
                  pauseTimer();
                } else {
                  startTimer();
                }
              }}
              className={`px-8 py-3.5 rounded-lg font-mono font-black text-sm flex items-center gap-3 cursor-pointer shadow-xl transition-transform active:translate-y-0.5 ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-[#141210]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>HALT TIMER</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>ENGAGE TIMER</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowMetronome(!showMetronome);
              }}
              className={`px-5 py-3.5 rounded-lg font-mono font-bold text-xs border transition-colors cursor-pointer ${
                showMetronome
                  ? 'bg-[#2b241c] text-amber-400 border-amber-600/50'
                  : 'bg-[#1c1813] text-[#c9bea8] border-[#382f23]'
              }`}
            >
              {showMetronome ? 'STOW METRONOME' : 'SHOW METRONOME'}
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('stomp');
                markItemDone(activeItem.id, true);
                nextItem();
              }}
              className="px-6 py-3.5 rounded-lg bg-[#221c16] hover:bg-[#2d251e] border border-[#3d3326] text-[#f2efe9] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>LOG & ADVANCE</span>
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
