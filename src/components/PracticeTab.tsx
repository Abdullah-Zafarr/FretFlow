import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Check,
  X,
  Play,
  RotateCw,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Hash,
  CheckCircle,
  Rewind,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import { ChordText } from './ChordText';
import { TimerRing } from './TimerRing';
import { Metronome } from './Metronome';
import { VideoAssistant } from './VideoAssistant';
import { soundEngine } from '../utils/audio';
import { formatTime, parseTimeToSeconds } from '../utils/time';

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
    prevItem,
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
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [editingNotes, setEditingNotes] = useState<boolean>(false);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [editingThings, setEditingThings] = useState<boolean>(false);
  const [thingsDraft, setThingsDraft] = useState<string>('');
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isEditingFocusTime, setIsEditingFocusTime] = useState<boolean>(false);
  const [scoreCountInput, setScoreCountInput] = useState<string>('');

  // Sync draft notes & video visibility whenever active item changes
  useEffect(() => {
    if (activeItem) {
      setNotesDraft(activeItem.notes || '');
      setThingsDraft(activeItem.thingsToRemember || '');
      setEditingNotes(false);
      setEditingThings(false);
      setScoreCountInput('');
      setShowVideo(Boolean(settings.alwaysPlayVideo));
    }
  }, [activeItem, settings.alwaysPlayVideo]);

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

  // Trigger completion modal when timer reaches 0
  useEffect(() => {
    if (timerSeconds === 0 && !isTimerRunning && activeItem) {
      setShowCompletionModal(true);
    }
  }, [timerSeconds, isTimerRunning, activeItem]);

  if (!activeRoutine) {
    return (
      <div className="p-12 text-center text-[#737373] bg-[#141414] border border-[#222222] rounded-lg max-w-lg mx-auto">
        <p className="text-base text-white font-medium">No routine currently active.</p>
        <p className="text-xs mt-1.5 text-[#888888]">Visit the <strong className="text-amber-400">Routines</strong> tab to select or build one.</p>
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
  const hasPrev = activeEntryIndex > 0;
  const hasNext = activeEntryIndex >= 0 && activeEntryIndex < activeRoutine.entries.length - 1;

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

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Routine Header */}
      <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#888888] mb-0.5">
            Routine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
            {activeRoutine.name}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#888888]">
            <span className="flex items-center gap-1 font-mono text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              {routineTotalMinutes}m total
            </span>
            <span>•</span>
            <span>{activeRoutine.entries.length} exercises</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Always play with video assistant checkbox */}
          <label className="flex items-center gap-2 text-xs text-[#a3a3a3] bg-[#1a1a1a] px-3 py-1.5 rounded-md border border-[#262626] cursor-pointer hover:border-[#383838] transition-colors select-none">
            <input
              type="checkbox"
              checked={settings.alwaysPlayVideo}
              onChange={(e) => {
                soundEngine.playMechanicalClick('toggle');
                updateSettings({ alwaysPlayVideo: e.target.checked });
              }}
              className="rounded bg-[#111111] border-[#333333] text-amber-400 focus:ring-0 cursor-pointer"
            />
            <span>Auto-show video</span>
          </label>

          {/* Reset Routine Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              resetRoutineDoneStatus();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#242424] text-[#d4d4d4] text-xs font-medium transition-colors cursor-pointer border border-[#262626]"
            title="Reset exercise completion marks"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset checkmarks</span>
          </button>
        </div>
      </div>

      {/* Active Exercise Card */}
      {activeItem ? (
        <div className="bg-[#141414] border border-[#262626] rounded-lg p-3.5 sm:p-4 space-y-3">
          {/* Item Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#222222]">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4.5 h-4.5 rounded bg-[#202020] text-[#a3a3a3] font-mono text-[10px] flex items-center justify-center">
                  {activeEntryIndex >= 0 ? activeEntryIndex + 1 : '•'}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                  {activeItem.category || 'Exercise'}
                </span>
                {isDoneThisSession && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-[#122417] border border-[#1d3d27] px-1.5 py-0.2 rounded">
                    <CheckCircle className="w-2.5 h-2.5" /> Done
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white m-0">
                <ChordText text={activeItem.name} />
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const currentFormatted = formatTime(timerSeconds);
                  const userInput = window.prompt('Set exercise duration (e.g. 5:00, 10, 45s):', currentFormatted);
                  if (userInput !== null) {
                    const parsed = parseTimeToSeconds(userInput);
                    if (parsed !== null && parsed >= 0) {
                      soundEngine.playMechanicalClick('toggle');
                      setTimerSeconds(parsed);
                    }
                  }
                }}
                className="flex items-center gap-1 bg-[#1c1c1c] text-amber-400 font-mono text-xs px-2 py-0.5 rounded border border-[#2a2a2a] hover:border-amber-500/50 hover:bg-[#222222] cursor-pointer transition-colors"
                title="Click to edit duration"
              >
                <Clock className="w-3 h-3" />
                {activeItemEntryMinutes} min
              </button>

              {/* Focus Mode Button */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setIsFocusMode(true);
                }}
                className="p-1 rounded-md bg-[#1a1a1a] hover:bg-[#262626] text-[#888888] hover:text-white border border-[#262626] transition-colors cursor-pointer"
                title="Fullscreen focus mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Central Grid: Timer + Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Minimalist Countdown Timer */}
            <div className="lg:col-span-5 flex justify-center">
              <TimerRing
                secondsLeft={timerSeconds}
                totalSeconds={timerTotalSeconds}
                isRunning={isTimerRunning}
                onPlay={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer}
                onMarkDoneFullTime={() => markItemDone(activeItem.id, true)}
                onPrev={prevItem}
                onSkip={nextItem}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onAdjustSeconds={handleAdjustTimer}
                onSetSeconds={setTimerSeconds}
              />
            </div>

            {/* Right side tools */}
            <div className="lg:col-span-7 space-y-2.5">
              {/* Metronome & Video Toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playMechanicalClick('toggle');
                    setShowMetronome(!showMetronome);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    showMetronome
                      ? 'bg-[#222222] text-amber-400 border-[#383838]'
                      : 'bg-[#181818] text-[#888888] border-[#262626] hover:text-white'
                  }`}
                >
                  {showMetronome ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{showMetronome ? 'Hide Metronome' : 'Show Metronome'}</span>
                </button>

                {(activeItem.videoUrl || settings.alwaysPlayVideo) && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('toggle');
                      setShowVideo(!showVideo);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                      showVideo
                        ? 'bg-[#222222] text-rose-400 border-[#383838]'
                        : 'bg-[#181818] text-[#888888] border-[#262626] hover:text-white'
                    }`}
                  >
                    {showVideo ? (
                      <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{showVideo ? 'Hide Video' : 'Show Video'}</span>
                  </button>
                )}
              </div>

              {/* Embedded Metronome Component */}
              {showMetronome && (
                <div className="animate-in fade-in duration-100">
                  <Metronome
                    initialBpm={activeItem.targetBpm || 80}
                    onBpmChange={(bpm) => updateItemBpm(activeItem.id, bpm)}
                    activeItemName={activeItem.name}
                  />
                </div>
              )}

              {/* Video Assistant */}
              {showVideo && (settings.alwaysPlayVideo || activeItem.videoUrl) && (
                <div className="animate-in fade-in duration-100">
                  <VideoAssistant
                    videoUrl={activeItem.videoUrl}
                    onUpdateUrl={(url) =>
                      saveItem({
                        ...activeItem,
                        videoUrl: url,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    onToggleHide={() => {
                      soundEngine.playMechanicalClick('toggle');
                      setShowVideo(false);
                    }}
                  />
                </div>
              )}

              {/* Side-by-side Notes & Key Reminders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Personal Notes */}
                <div className="bg-[#181818] border border-[#242424] rounded-md p-2.5">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#202020]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                      Notes
                    </span>
                    {!editingNotes ? (
                      <button
                        type="button"
                        onClick={() => setEditingNotes(true)}
                        className="text-[#737373] hover:text-amber-400 p-0.5 cursor-pointer"
                        title="Edit Notes"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
                          title="Save Notes"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotesDraft(activeItem.notes || '');
                            setEditingNotes(false);
                          }}
                          className="text-[#737373] hover:text-white p-0.5 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingNotes ? (
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={2}
                      className="w-full bg-[#111111] border border-[#2e2e2e] rounded p-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="Add practice notes..."
                    />
                  ) : (
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed m-0">
                      {activeItem.notes ? activeItem.notes : <span className="text-[#525252] italic">No notes yet. Click pencil to add.</span>}
                    </p>
                  )}
                </div>

                {/* Things to Remember (Key Cues) */}
                <div className="bg-[#181818] border border-[#242424] rounded-md p-2.5">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#202020]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      Key Reminders
                    </span>
                    {!editingThings ? (
                      <button
                        type="button"
                        onClick={() => setEditingThings(true)}
                        className="text-[#737373] hover:text-amber-400 p-0.5 cursor-pointer"
                        title="Edit Reminders"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleSaveThings}
                          className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
                          title="Save Cues"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setThingsDraft(activeItem.thingsToRemember || '');
                            setEditingThings(false);
                          }}
                          className="text-[#737373] hover:text-white p-0.5 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingThings ? (
                    <textarea
                      value={thingsDraft}
                      onChange={(e) => setThingsDraft(e.target.value)}
                      rows={2}
                      className="w-full bg-[#111111] border border-[#2e2e2e] rounded p-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                      placeholder="Add key practice reminders..."
                    />
                  ) : (
                    <p className="text-[11px] text-[#d4d4d4] leading-relaxed m-0">
                      {activeItem.thingsToRemember ? (
                        `“${activeItem.thingsToRemember}”`
                      ) : (
                        <span className="text-[#525252] italic">No reminders added.</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#141414] rounded-lg border border-[#222222] text-[#737373] text-sm">
          Select an exercise below to begin practicing.
        </div>
      )}

      {/* Routine Exercises Roster */}
      <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f] mb-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#888888] flex items-center gap-2 m-0">
            <span>Exercises in Routine</span>
            <span className="text-[11px] text-[#555555]">
              ({activeRoutine.entries.filter((e) => e.doneThisSession).length}/{activeRoutine.entries.length} completed)
            </span>
          </h3>
          <span className="text-[11px] text-[#555555] hidden sm:inline">
            Click any exercise to make it active
          </span>
        </div>

        <div className="divide-y divide-[#1c1c1c]">
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
                className={`py-3 px-2 sm:px-3 rounded-md flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#1c1c1c] text-white'
                    : 'hover:bg-[#181818] text-[#a3a3a3]'
                }`}
              >
                {/* Left: Number + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playMechanicalClick('stomp');
                      markItemDone(item.id, true);
                    }}
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isSelected
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-[#202020] text-[#737373] hover:text-white'
                    }`}
                    title={isDone ? 'Completed' : 'Click to mark as done'}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
                  </button>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate flex items-center gap-2">
                      <ChordText text={item.name} />
                      {isSelected && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          Active
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-[#666666] truncate max-w-lg mt-0.5">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration + Play */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-xs font-mono text-[#737373]">
                    {durationMins}m
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playMechanicalClick('stomp');
                      selectActiveItem(item.id);
                      startTimer();
                    }}
                    className="p-1 rounded text-[#737373] hover:text-white transition-colors cursor-pointer"
                    title="Play exercise"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-100">
          <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg max-w-md w-full p-5 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>

            <div>
              <div className="text-[11px] font-mono text-emerald-400 mb-0.5">
                Target Reached
              </div>
              <h3 className="text-lg font-bold text-white m-0">
                {activeItem.name}
              </h3>
              <p className="text-xs text-[#888888] mt-1 font-mono">
                Duration: {activeItemEntryMinutes} minutes
              </p>
            </div>

            {/* Repetitions Tracker */}
            <div className="bg-[#121212] border border-[#222222] rounded p-3 text-left">
              <label className="flex items-center gap-1.5 text-xs text-[#a3a3a3] mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Reps / 1-Min Changes (optional):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={scoreCountInput}
                  onChange={(e) => setScoreCountInput(e.target.value)}
                  placeholder="e.g. 52"
                  className="flex-1 bg-[#181818] border border-[#262626] rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-[#666666]">changes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                onClick={handleModalDoneAndNext}
                className="w-full py-2.5 px-3 rounded-md bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Complete & Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleModalRepeat}
                className="w-full py-2 px-3 rounded-md bg-[#222222] hover:bg-[#2a2a2a] text-[#d4d4d4] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Repeat (+{activeItemEntryMinutes}m)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setShowCompletionModal(false);
                }}
                className="w-full py-1 text-xs text-[#737373] hover:text-[#d4d4d4] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode */}
      {isFocusMode && activeItem && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0d] flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-100">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
            <div>
              <div className="text-[11px] font-mono text-[#737373]">
                Focus Mode • {activeRoutine.name}
              </div>
              <h2 className="text-xl font-bold text-white m-0">
                <ChordText text={activeItem.name} />
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setIsFocusMode(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] text-xs cursor-pointer"
              title="Exit (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit (Esc)</span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center text-center my-auto space-y-4">
            {isEditingFocusTime ? (
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  autoFocus
                  defaultValue={formatTime(timerSeconds)}
                  onBlur={(e) => {
                    const parsed = parseTimeToSeconds(e.target.value);
                    if (parsed !== null && parsed >= 0) {
                      soundEngine.playMechanicalClick('toggle');
                      setTimerSeconds(parsed);
                    }
                    setIsEditingFocusTime(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const parsed = parseTimeToSeconds(e.currentTarget.value);
                      if (parsed !== null && parsed >= 0) {
                        soundEngine.playMechanicalClick('toggle');
                        setTimerSeconds(parsed);
                      }
                      setIsEditingFocusTime(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingFocusTime(false);
                    }
                  }}
                  className="text-7xl sm:text-8xl md:text-9xl font-mono text-center text-white bg-[#141414] border-2 border-amber-500 rounded-xl px-4 py-2 w-72 sm:w-96 outline-none shadow-xl shadow-amber-500/20"
                />
                <span className="text-xs font-mono text-amber-400 mt-2">
                  Enter to save • Esc to cancel
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isTimerRunning) pauseTimer();
                  setIsEditingFocusTime(true);
                }}
                className="text-8xl sm:text-9xl md:text-[10rem] font-mono font-medium tracking-tight text-white select-none hover:text-amber-400 transition-colors cursor-pointer"
                title="Click to edit time"
              >
                {formatTime(timerSeconds)}
              </button>
            )}

            {activeItem.thingsToRemember && (
              <p className="text-sm sm:text-base text-[#a3a3a3] max-w-lg m-0">
                “{activeItem.thingsToRemember}”
              </p>
            )}

            {showMetronome && (
              <div className="w-full max-w-xs pt-4">
                <Metronome
                  initialBpm={activeItem.targetBpm || 80}
                  onBpmChange={(bpm) => updateItemBpm(activeItem.id, bpm)}
                  activeItemName={activeItem.name}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#1f1f1f]">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                prevItem();
              }}
              className="px-3.5 py-2.5 rounded-md bg-[#181818] border border-[#262626] text-[#a3a3a3] hover:text-white text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous exercise"
            >
              <Rewind className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

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
              className={`px-6 py-2.5 rounded-md font-medium text-xs flex items-center gap-2 cursor-pointer ${
                isTimerRunning
                  ? 'bg-amber-400 text-black'
                  : 'bg-white text-black'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowMetronome(!showMetronome);
              }}
              className="px-4 py-2.5 rounded-md text-xs bg-[#181818] border border-[#262626] text-[#a3a3a3] hover:text-white cursor-pointer"
            >
              {showMetronome ? 'Hide Metronome' : 'Show Metronome'}
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('stomp');
                markItemDone(activeItem.id, true);
                nextItem();
              }}
              className="px-4 py-2.5 rounded-md bg-[#181818] border border-[#262626] text-[#a3a3a3] hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Done & Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
