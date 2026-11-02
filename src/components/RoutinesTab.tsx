import React, { useState } from 'react';
import {
  Play,
  Edit2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  ListOrdered,
  Save,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import type { Routine, RoutineEntry } from '../types/practice';
import { ChordText } from './ChordText';
import { soundEngine } from '../utils/audio';

interface RoutinesTabProps {
  onSwitchToPractice: () => void;
}

export const RoutinesTab: React.FC<RoutinesTabProps> = ({ onSwitchToPractice }) => {
  const {
    routines,
    items,
    activeRoutine,
    activateRoutine,
    saveRoutine,
    deleteRoutine,
    createRoutine,
  } = usePractice();

  // Collapsible view states to keep page readable and uncluttered
  const [showActiveExercises, setShowActiveExercises] = useState(true);
  const [previewRoutineId, setPreviewRoutineId] = useState<string | null>(null);

  // Editing state
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isNewRoutine, setIsNewRoutine] = useState(false);
  const [searchItemTerm, setSearchItemTerm] = useState('');

  // Active items only (not archived) for the selector
  const activeLibraryItems = items.filter((i) => !i.archived);

  // Inactive routines
  const inactiveRoutines = routines.filter((r) => !r.active);

  const calculateTotalMinutes = (entries: RoutineEntry[]) => {
    return entries.reduce((acc, entry) => {
      const item = items.find((i) => i.id === entry.itemId);
      return acc + (entry.minutes || item?.defaultMinutes || 0);
    }, 0);
  };

  const handleStartEdit = (routine: Routine, isNew = false) => {
    soundEngine.playMechanicalClick('toggle');
    setEditingRoutine(JSON.parse(JSON.stringify(routine)));
    setIsNewRoutine(isNew);
  };

  const handleCreateNew = () => {
    soundEngine.playMechanicalClick('stomp');
    const fresh = createRoutine('New Practice Routine', 'Custom personalized sequence.');
    handleStartEdit(fresh, true);
  };

  const handleSaveEditor = () => {
    soundEngine.playMechanicalClick('stomp');
    if (!editingRoutine) return;
    saveRoutine(editingRoutine);
    setEditingRoutine(null);
  };

  const handleAddItemToRoutine = (itemId: string) => {
    soundEngine.playMechanicalClick('toggle');
    if (!editingRoutine) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newEntry: RoutineEntry = {
      itemId,
      minutes: item.defaultMinutes,
      doneThisSession: false,
    };

    setEditingRoutine({
      ...editingRoutine,
      entries: [...editingRoutine.entries, newEntry],
    });
  };

  const handleRemoveEntry = (index: number) => {
    soundEngine.playMechanicalClick('toggle');
    if (!editingRoutine) return;
    const updated = [...editingRoutine.entries];
    updated.splice(index, 1);
    setEditingRoutine({ ...editingRoutine, entries: updated });
  };

  const handleMoveEntry = (index: number, direction: 'up' | 'down') => {
    soundEngine.playMechanicalClick('rotary');
    if (!editingRoutine) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingRoutine.entries.length) return;

    const updated = [...editingRoutine.entries];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setEditingRoutine({ ...editingRoutine, entries: updated });
  };

  const handleUpdateEntryMinutes = (index: number, minutes: number) => {
    if (!editingRoutine) return;
    const clamped = Math.max(1, Math.min(120, minutes));
    const updated = [...editingRoutine.entries];
    updated[index] = { ...updated[index], minutes: clamped };
    setEditingRoutine({ ...editingRoutine, entries: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight m-0">
            Practice Routines
          </h2>
          <p className="text-sm text-neutral-400 mt-1.5 font-sans">
            Structure your practice into deliberate sessions. Choose an active routine to run in the player.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Featured Section: Active Routine Hero Card */}
      <div className="space-y-3">
        {activeRoutine && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowActiveExercises(!showActiveExercises);
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{showActiveExercises ? 'Collapse Exercises' : `View ${activeRoutine.entries.length} Exercises`}</span>
              {showActiveExercises ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {activeRoutine ? (
          <div className="bg-[#141414] border border-[#2a2a2a] hover:border-[#383838] rounded-xl p-5 sm:p-7 space-y-6 shadow-sm transition-all">
            {/* Routine Top Info */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-[260px]">
                <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
                  {activeRoutine.name}
                </h4>
                {activeRoutine.description && (
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed m-0 max-w-2xl font-sans">
                    {activeRoutine.description}
                  </p>
                )}

                {/* Metrics Pill Bar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-md">
                    {calculateTotalMinutes(activeRoutine.entries)}m total
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-200 bg-[#222222] border border-[#333333] px-3 py-1 rounded-md">
                    {activeRoutine.entries.length} exercises
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(activeRoutine)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] border border-[#383838] text-neutral-200 hover:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                  title="Edit Routine Details & Sequence"
                >
                  <Edit2 className="w-4 h-4 text-neutral-400" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playMechanicalClick('stomp');
                    onSwitchToPractice();
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
                  title="Open this routine in Practice Player"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Practice Now</span>
                </button>
              </div>
            </div>

            {/* Exercises Grid in Active Routine */}
            {showActiveExercises && (
              <div className="pt-4 border-t border-[#242424] space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  <span>Exercise Sequence ({activeRoutine.entries.length})</span>
                  <span className="text-neutral-500">Ordered by practice flow</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;

                    return (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-lg bg-[#181818] border border-[#242424] hover:border-[#333333] flex items-center justify-between gap-3 text-sm transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-md bg-[#222222] text-neutral-300 font-mono flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-neutral-100 truncate">
                            <ChordText text={item.name} />
                          </span>
                        </div>
                        <span className="text-xs sm:text-[13px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded flex-shrink-0">
                          {entry.minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#141414] rounded-xl border border-[#242424] text-neutral-400 text-sm">
            No active routine selected. Choose one below or create a new routine.
          </div>
        )}
      </div>

      {/* Section 2: Other Routines Catalog */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight m-0">
            Other Saved Routines ({inactiveRoutines.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inactiveRoutines.map((routine) => {
            const totalMins = calculateTotalMinutes(routine.entries);
            const isPreviewing = previewRoutineId === routine.id;

            return (
              <div
                key={routine.id}
                className="bg-[#141414] border border-[#242424] hover:border-[#333333] rounded-xl p-5 sm:p-6 space-y-4 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-lg font-bold text-white tracking-tight m-0">
                      {routine.name}
                    </h4>

                    <span className="font-mono text-xs sm:text-[13px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-md flex-shrink-0">
                      {totalMins}m
                    </span>
                  </div>

                  {routine.description && (
                    <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed m-0 font-sans">
                      {routine.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-mono text-neutral-400 font-medium">
                      {routine.entries.length} exercises
                    </span>
                    <span className="text-neutral-600">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playMechanicalClick('toggle');
                        setPreviewRoutineId(isPreviewing ? null : routine.id);
                      }}
                      className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isPreviewing ? 'Hide drills' : 'Preview drills'}</span>
                      {isPreviewing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Optional Preview Accordion */}
                {isPreviewing && (
                  <div className="pt-3 border-t border-[#222222] space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-in fade-in duration-100">
                    {routine.entries.map((entry, idx) => {
                      const item = items.find((i) => i.id === entry.itemId);
                      if (!item) return null;

                      return (
                        <div
                          key={idx}
                          className="p-2 rounded bg-[#181818] border border-[#222222] flex items-center justify-between text-xs"
                        >
                          <span className="text-neutral-200 font-medium truncate">
                            {idx + 1}. {item.name}
                          </span>
                          <span className="font-mono text-neutral-400 text-xs ml-2 flex-shrink-0">
                            {entry.minutes}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#222222]">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('stomp');
                      activateRoutine(routine.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-emerald-600 hover:text-white text-neutral-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-[#333333]"
                    title="Set as active routine"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Activate</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(routine)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit Routine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playMechanicalClick('toggle');
                        if (window.confirm(`Delete routine "${routine.name}"?`)) {
                          deleteRoutine(routine.id);
                        }
                      }}
                      className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Delete Routine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {inactiveRoutines.length === 0 && (
            <div className="col-span-full p-8 text-center bg-[#141414] rounded-xl border border-[#242424] text-neutral-400 text-sm">
              No inactive routines saved. Click "New Routine" to design your custom sequences.
            </div>
          )}
        </div>
      </div>

      {/* Routine Editor Modal */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-100">
          <div className="bg-[#141414] border border-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#242424]">
              <div className="flex items-center gap-2.5">
                <ListOrdered className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white m-0">
                  {isNewRoutine ? 'Create Practice Routine' : 'Edit Practice Routine'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingRoutine(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.name}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, name: e.target.value })
                    }
                    className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Daily Warmup & Barre Chords"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.description || ''}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, description: e.target.value })
                    }
                    className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Focus on clean chord changes"
                  />
                </div>
              </div>

              {/* Total Minutes Banner */}
              <div className="bg-[#121212] border border-[#242424] rounded-lg p-3 flex items-center justify-between text-sm">
                <span className="text-neutral-300 font-medium">Total Routine Duration:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {calculateTotalMinutes(editingRoutine.entries)} mins
                </span>
              </div>

              {/* Entries List */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Exercises in Routine ({editingRoutine.entries.length})
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editingRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;

                    return (
                      <div
                        key={idx}
                        className="bg-[#121212] border border-[#242424] rounded-lg p-2.5 sm:p-3 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded bg-[#202020] text-neutral-300 font-mono flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-neutral-100 truncate">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1">
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={entry.minutes}
                              onChange={(e) =>
                                handleUpdateEntryMinutes(idx, parseInt(e.target.value) || 1)
                              }
                              className="w-9 bg-transparent text-center font-mono text-amber-300 text-sm font-semibold focus:outline-none"
                            />
                            <span className="text-neutral-400 text-xs">m</span>
                          </div>

                          {/* Reorder Buttons */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveEntry(idx, 'up')}
                            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editingRoutine.entries.length - 1}
                            onClick={() => handleMoveEntry(idx, 'down')}
                            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(idx)}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {editingRoutine.entries.length === 0 && (
                    <div className="p-6 text-center text-neutral-400 text-sm italic">
                      No exercises added yet. Select exercises from the library below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Items from Library */}
              <div className="border-t border-[#242424] pt-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Add from Library
                  </span>
                  <input
                    type="text"
                    value={searchItemTerm}
                    onChange={(e) => setSearchItemTerm(e.target.value)}
                    placeholder="Search drill..."
                    className="bg-[#101010] border border-[#2c2c2c] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-400 w-48"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {activeLibraryItems
                    .filter((item) =>
                      item.name.toLowerCase().includes(searchItemTerm.toLowerCase())
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddItemToRoutine(item.id)}
                        className="p-2.5 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] border border-[#242424] hover:border-[#383838] text-left flex items-center justify-between text-sm transition-colors cursor-pointer group"
                      >
                        <span className="text-neutral-300 group-hover:text-white font-medium truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded ml-2 flex-shrink-0 font-semibold">
                          +{item.defaultMinutes}m
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#242424] bg-[#121212] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingRoutine(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Routine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
