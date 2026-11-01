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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#222222]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
            Routines
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-sans">
            Organize exercises into structured practice sessions. One routine is active at a time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Two Column Layout: Active Routine (Left) & Inactive Routines (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Current Active Routine */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#a3a3a3] m-0">
              Active Routine
            </h3>
          </div>

          {activeRoutine ? (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#202020]">
                <div>
                  <h4 className="text-lg font-bold text-white m-0">
                    {activeRoutine.name}
                  </h4>
                  {activeRoutine.description && (
                    <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                      {activeRoutine.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#a3a3a3]">
                    <span className="text-amber-400">
                      {calculateTotalMinutes(activeRoutine.entries)}m total
                    </span>
                    <span>•</span>
                    <span>{activeRoutine.entries.length} items</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(activeRoutine)}
                    className="p-1.5 rounded bg-[#1c1c1c] hover:bg-[#262626] border border-[#2e2e2e] text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
                    title="Edit Routine"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('stomp');
                      onSwitchToPractice();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs transition-colors cursor-pointer"
                    title="Open in Practice Player"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>

              {/* Items in active routine */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-[#666666] mb-1">
                  Exercises
                </div>
                <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
                  {activeRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;
                    return (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#181818] border border-[#222222] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-[#222222] text-[#888888] font-mono flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-[#d4d4d4] truncate">
                            <ChordText text={item.name} />
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#888888] flex-shrink-0">
                          {entry.minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#141414] rounded-lg border border-[#222222] text-[#737373] text-xs">
              No active routine selected.
            </div>
          )}
        </div>

        {/* Right Column: Inactive Routines */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#737373] m-0">
              Other Routines ({inactiveRoutines.length})
            </h3>
          </div>

          <div className="space-y-2">
            {inactiveRoutines.map((routine) => {
              const totalMins = calculateTotalMinutes(routine.entries);
              return (
                <div
                  key={routine.id}
                  className="bg-[#141414] border border-[#222222] hover:border-[#2e2e2e] rounded-lg p-3.5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white m-0">
                        {routine.name}
                      </h4>
                      {routine.description && (
                        <p className="text-xs text-[#737373] mt-0.5 line-clamp-1">
                          {routine.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs font-mono text-[#888888]">
                        <span className="text-amber-400 font-medium">
                          {totalMins}m
                        </span>
                        <span>•</span>
                        <span>{routine.entries.length} exercises</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('stomp');
                          activateRoutine(routine.id);
                        }}
                        className="px-2.5 py-1 rounded bg-[#202020] hover:bg-emerald-600 hover:text-white text-[#d4d4d4] text-xs font-medium transition-colors cursor-pointer"
                        title="Set as active routine"
                      >
                        Activate
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(routine)}
                        className="p-1.5 rounded bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] text-[#888888] hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          if (window.confirm(`Delete routine "${routine.name}"?`)) {
                            deleteRoutine(routine.id);
                          }
                        }}
                        className="p-1.5 rounded bg-[#1c1c1c] hover:bg-rose-950/60 border border-[#262626] text-[#737373] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {inactiveRoutines.length === 0 && (
              <div className="p-6 text-center bg-[#141414] rounded-lg border border-[#222222] text-[#666666] text-xs">
                No inactive routines. Use "New Routine" to create variations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Routine Editor Modal */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-100">
          <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white m-0">
                  {isNewRoutine ? 'Create Practice Routine' : 'Edit Practice Routine'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingRoutine(null);
                }}
                className="p-1 rounded text-[#737373] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.name}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, name: e.target.value })
                    }
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Daily Warmup & Barre Chords"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.description || ''}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, description: e.target.value })
                    }
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Focus on clean chord changes"
                  />
                </div>
              </div>

              {/* Total Minutes Banner */}
              <div className="bg-[#121212] border border-[#222222] rounded p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#888888]">Total Routine Duration:</span>
                <span className="font-mono text-amber-400 font-medium">
                  {calculateTotalMinutes(editingRoutine.entries)} mins
                </span>
              </div>

              {/* Entries List */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-[#888888]">
                  Exercises ({editingRoutine.entries.length})
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {editingRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;

                    return (
                      <div
                        key={idx}
                        className="bg-[#121212] border border-[#222222] rounded p-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-[#1e1e1e] text-[#888888] font-mono flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-[#d4d4d4] truncate">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded px-1.5 py-0.5">
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={entry.minutes}
                              onChange={(e) =>
                                handleUpdateEntryMinutes(idx, parseInt(e.target.value) || 1)
                              }
                              className="w-8 bg-transparent text-center font-mono text-amber-400 text-xs focus:outline-none"
                            />
                            <span className="text-[#666666] text-[10px]">m</span>
                          </div>

                          {/* Reorder Buttons */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveEntry(idx, 'up')}
                            className="p-1 text-[#737373] hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editingRoutine.entries.length - 1}
                            onClick={() => handleMoveEntry(idx, 'down')}
                            className="p-1 text-[#737373] hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(idx)}
                            className="p-1 text-[#737373] hover:text-rose-400 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {editingRoutine.entries.length === 0 && (
                    <div className="p-4 text-center text-[#666666] text-xs italic">
                      No exercises added yet. Select exercises from the list below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Items from Library */}
              <div className="border-t border-[#222222] pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#888888]">
                    Add Exercises
                  </span>
                  <input
                    type="text"
                    value={searchItemTerm}
                    onChange={(e) => setSearchItemTerm(e.target.value)}
                    placeholder="Search exercise..."
                    className="bg-[#121212] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 w-40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeLibraryItems
                    .filter((item) =>
                      item.name.toLowerCase().includes(searchItemTerm.toLowerCase())
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddItemToRoutine(item.id)}
                        className="p-2 rounded bg-[#121212] hover:bg-[#1a1a1a] border border-[#202020] hover:border-[#2e2e2e] text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <span className="text-[#a3a3a3] group-hover:text-white truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#666666] flex-shrink-0">
                          +{item.defaultMinutes}m
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-5 border-t border-[#222222] bg-[#141414] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingRoutine(null);
                }}
                className="px-3 py-1.5 rounded text-xs text-[#888888] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Routine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
