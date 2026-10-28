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
  Sparkles,
  Trophy,
  Maximize2,
  Minimize2,
  FastForward,
  Pause,
  Hash,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePractice } from '../context/usePractice';
import { ChordText } from './ChordText';
import { TimerRing } from './TimerRing';
import { Metronome } from './Metronome';
import { VideoAssistant } from './VideoAssistant';

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

  // Trigger celebration modal when timer reaches 0
  useEffect(() => {
    if (timerSeconds === 0 && !isTimerRunning && activeItem) {
      setShowCompletionModal(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [timerSeconds, isTimerRunning, activeItem]);

  if (!activeRoutine) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-lg">No active routine selected.</p>
        <p className="text-sm mt-2">Visit the <strong className="text-amber-400">Routines</strong> tab to pick or build one.</p>
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
    if (activeItemId) {
      updateItemNotes(activeItemId, notesDraft);
    }
    setEditingNotes(false);
  };

  const handleSaveThings = () => {
    if (activeItemId) {
      updateItemThingsToRemember(activeItemId, thingsDraft);
    }
    setEditingThings(false);
  };

  const handleAdjustTimer = (deltaSecs: number) => {
    setTimerSeconds(Math.max(0, timerSeconds + deltaSecs));
  };

  const handleModalDoneAndNext = () => {
    setShowCompletionModal(false);
    if (activeItemId) {
      const score = scoreCountInput ? parseInt(scoreCountInput, 10) : undefined;
      markItemDone(activeItemId, true, undefined, isNaN(score as number) ? undefined : score);
      setScoreCountInput('');
    }
  };

  const handleModalRepeat = () => {
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
      {/* 2.1 Routine Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-bold text-amber-500 mb-1">
            Current Practice Routine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {activeRoutine.name}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              TOTAL {routineTotalMinutes} MINS.
            </span>
            <span>•</span>
            <span>{activeRoutine.entries.length} exercises</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Always play with video assistant checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={settings.alwaysPlayVideo}
              onChange={(e) => updateSettings({ alwaysPlayVideo: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Always play with video assistant</span>
          </label>

          {/* Reset Routine Button */}
          <button
            type="button"
            onClick={() => resetRoutineDoneStatus()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700 active:scale-95 shadow-sm"
            title="Clear all completed marks to run routine again"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Routine</span>
          </button>
        </div>
      </div>

      {/* 2.2 Active (Expanded) Item Panel */}
      {activeItem ? (
        <div className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          {/* Item Title and Duration */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/40">
                  {activeEntryIndex >= 0 ? activeEntryIndex + 1 : '•'}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  {activeItem.category || 'Exercise'}
                </span>
                {isDoneThisSession && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Done this session
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                <ChordText text={activeItem.name} />
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-extrabold text-sm px-3.5 py-1.5 rounded-xl border border-amber-500/30">
                <Clock className="w-4 h-4" />
                {activeItemEntryMinutes} MINS
              </span>

              {/* Fullscreen Focus Mode Button */}
              <button
                type="button"
                onClick={() => setIsFocusMode(true)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors"
                title="Open Focus Mode (large display across room)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Grid: Timer + Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
            {/* Countdown Timer with SVG Ring */}
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

            {/* Right side tools: Metronome Toggle & Details */}
            <div className="lg:col-span-7 space-y-4">
              {/* Toggle Buttons: Metronome & Video */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMetronome(!showMetronome)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    showMetronome
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {showMetronome ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-400" />}
                  <span>{showMetronome ? 'Hide metronome' : 'Show metronome'}</span>
                </button>

                {activeItem.videoUrl && (
                  <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 border border-rose-900/50 text-rose-300">
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    Video available
                  </span>
                )}
              </div>

              {/* Embedded Metronome Component */}
              {showMetronome && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
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

              {/* Notes Section with Inline Edit */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Notes
                  </span>
                  {!editingNotes ? (
                    <button
                      type="button"
                      onClick={() => setEditingNotes(true)}
                      className="text-slate-400 hover:text-amber-400 p-1 transition-colors"
                      title="Edit Notes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="text-emerald-400 hover:text-emerald-300 p-1"
                        title="Save Notes"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotesDraft(activeItem.notes || '');
                          setEditingNotes(false);
                        }}
                        className="text-slate-400 hover:text-slate-300 p-1"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Add personal practice notes..."
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {activeItem.notes ? activeItem.notes : 'No personal notes yet. Click the pencil icon to add notes.'}
                  </p>
                )}
              </div>

              {/* Things to Remember Section */}
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Things to Remember (Key Cues)
                  </span>
                  {!editingThings ? (
                    <button
                      type="button"
                      onClick={() => setEditingThings(true)}
                      className="text-amber-500/70 hover:text-amber-300 p-1 transition-colors"
                      title="Edit Things to Remember"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveThings}
                        className="text-emerald-400 hover:text-emerald-300 p-1"
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
                        className="text-slate-400 hover:text-slate-300 p-1"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                    placeholder="Add key practice cues to keep in mind..."
                  />
                ) : (
                  <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                    {activeItem.thingsToRemember ? (
                      `“${activeItem.thingsToRemember}”`
                    ) : (
                      <span className="text-slate-500 italic">No cues added.</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
          Select an exercise below to begin practicing.
        </div>
      )}

      {/* 2.4 Routine Items List (Below the active item) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Routine Exercises</span>
            <span className="text-xs font-normal text-slate-500">
              ({activeRoutine.entries.filter((e) => e.doneThisSession).length}/{activeRoutine.entries.length} completed)
            </span>
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Click any exercise to make it active (out of order allowed)
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {activeRoutine.entries.map((entry, index) => {
            const item = items.find((i) => i.id === entry.itemId);
            if (!item) return null;

            const isSelected = activeItemId === item.id;
            const isDone = Boolean(entry.doneThisSession);
            const durationMins = entry.minutes || item.defaultMinutes;

            return (
              <div
                key={`${entry.itemId}-${index}`}
                onClick={() => selectActiveItem(item.id)}
                className={`p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Left: Status Icon + Number + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markItemDone(item.id, true);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-transform active:scale-90 ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : isSelected
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    title={isDone ? 'Completed! Click to re-log' : 'Click to mark as done'}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                  </button>

                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-200 truncate flex items-center gap-2">
                      <ChordText text={item.name} />
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                          Active
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-slate-500 truncate max-w-lg mt-0.5">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration + Play button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {durationMins} MINS
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectActiveItem(item.id);
                      startTimer();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                    title="Play this exercise"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* End-of-Timer Celebration & Next Step Modal (Section 2.3 & 10) */}
      {showCompletionModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-amber-400 mb-1">
                <Sparkles className="w-4 h-4" /> Time's Up!
              </div>
              <h3 className="text-xl font-bold text-white">
                {activeItem.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Completed scheduled duration of <strong className="text-slate-200">{activeItemEntryMinutes} minutes</strong>.
              </p>
            </div>

            {/* Repetitions / One-Minute Changes Score Logger (Section 10 Idea #1) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                <span>Track Reps / Changes Count (optional):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={scoreCountInput}
                  onChange={(e) => setScoreCountInput(e.target.value)}
                  placeholder="e.g. 45 changes"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500">changes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                type="button"
                onClick={handleModalDoneAndNext}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Done & Advance to Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleModalRepeat}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Repeat Item (+{activeItemEntryMinutes} mins)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 font-medium"
              >
                Stay on this item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Focus Mode (Section 10 Idea #7) */}
      {isFocusMode && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 sm:p-12 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/40">
                {activeEntryIndex >= 0 ? activeEntryIndex + 1 : '•'}
              </span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Focus Mode • {activeRoutine.name}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  <ChordText text={activeItem.name} />
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFocusMode(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs"
              title="Exit Focus Mode (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit (Esc)</span>
            </button>
          </div>

          {/* Center Giant Timer & Cues */}
          <div className="flex flex-col items-center justify-center text-center my-auto space-y-6">
            <div className="text-7xl sm:text-9xl md:text-[11rem] font-mono font-black tracking-tight text-white select-none drop-shadow-2xl">
              {formatTime(timerSeconds)}
            </div>

            {/* Things to Remember Cue Banner */}
            {activeItem.thingsToRemember && (
              <div className="max-w-2xl bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  Focus Cue
                </span>
                <p className="text-base sm:text-lg text-amber-200 font-bold leading-relaxed">
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
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={isTimerRunning ? pauseTimer : startTimer}
              className={`px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl transition-transform active:scale-95 ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/30'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-6 h-6 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  <span>Start Timer</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowMetronome(!showMetronome)}
              className={`px-5 py-4 rounded-2xl font-bold text-sm border transition-colors ${
                showMetronome
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              {showMetronome ? 'Hide Metronome' : 'Show Metronome'}
            </button>

            <button
              type="button"
              onClick={() => {
                markItemDone(activeItem.id, true);
                nextItem();
              }}
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Mark Done & Next</span>
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
