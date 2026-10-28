import React, { useState } from 'react';
import {
  Play,
  Edit2,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  X,
  ListOrdered,
  Save,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import type { Routine, RoutineEntry } from '../types/practice';
import { ChordText } from './ChordText';

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
    setEditingRoutine(JSON.parse(JSON.stringify(routine)));
    setIsNewRoutine(isNew);
  };

  const handleCreateNew = () => {
    const fresh = createRoutine('New Practice Routine', 'Custom personalized routine.');
    handleStartEdit(fresh, true);
  };

  const handleSaveEditor = () => {
    if (!editingRoutine) return;
    saveRoutine(editingRoutine);
    setEditingRoutine(null);
  };

  const handleAddItemToRoutine = (itemId: string) => {
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
    if (!editingRoutine) return;
    const updated = [...editingRoutine.entries];
    updated.splice(index, 1);
    setEditingRoutine({ ...editingRoutine, entries: updated });
  };

  const handleMoveEntry = (index: number, direction: 'up' | 'down') => {
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Routines</h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize exercises into structured daily practice plans. Exactly one routine is active at a time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Routine</span>
        </button>
      </div>

      {/* Two Column Layout: Active Routine (Left) & Inactive Routines (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Current Active Routine */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Current Active Routine
            </h3>
          </div>

          {activeRoutine ? (
            <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xl font-extrabold text-white">
                    {activeRoutine.name}
                  </h4>
                  {activeRoutine.description && (
                    <p className="text-xs text-slate-400 mt-1">{activeRoutine.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {calculateTotalMinutes(activeRoutine.entries)} MINS
                    </span>
                    <span>{activeRoutine.entries.length} items</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(activeRoutine)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Routine"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onSwitchToPractice}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 shadow-md"
                    title="Open in Practice Player"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Practice Now</span>
                  </button>
                </div>
              </div>

              {/* Items in active routine */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                  Routine Exercises
                </div>
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                  {activeRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">
                            <ChordText text={item.name} />
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex-shrink-0">
                          {entry.minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No active routine selected.
            </div>
          )}
        </div>

        {/* Right Column: Inactive Routines */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Saved / Inactive Routines ({inactiveRoutines.length})
            </h3>
          </div>

          <div className="space-y-3">
            {inactiveRoutines.map((routine) => {
              const totalMins = calculateTotalMinutes(routine.entries);
              return (
                <div
                  key={routine.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-200">
                        {routine.name}
                      </h4>
                      {routine.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {routine.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2.5 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-amber-400/90">
                          <Clock className="w-3 h-3" />
                          {totalMins} MINS
                        </span>
                        <span>•</span>
                        <span>{routine.entries.length} items</span>
                      </div>
                    </div>

                    {/* Action buttons: Activate (+), Edit, Delete */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => activateRoutine(routine.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                        title="Set as Active Routine"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(routine)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Routine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete routine "${routine.name}"?`)) {
                            deleteRoutine(routine.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-500 transition-colors"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {inactiveRoutines.length === 0 && (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
                No inactive routines. Use "Add New Routine" to create variations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Routine Editor Modal */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {isNewRoutine ? 'Create Practice Routine' : 'Edit Practice Routine'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoutine(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Routine metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.name}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Daily Warmup & Barre Chords"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Description / Focus
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.description || ''}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, description: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Focus on clean chord changes and rhythm"
                  />
                </div>
              </div>

              {/* Routine Total Minutes Banner */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Total Scheduled Time:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {calculateTotalMinutes(editingRoutine.entries)} MINS
                </span>
              </div>

              {/* Entries List with Reorder & Duration Controls */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Exercises in this routine ({editingRoutine.entries.length})
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editingRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        {/* Order & Title */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">
                            {item.name}
                          </span>
                        </div>

                        {/* Minutes adjustment + Move + Remove */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={entry.minutes}
                              onChange={(e) =>
                                handleUpdateEntryMinutes(idx, parseInt(e.target.value) || 1)
                              }
                              className="w-10 bg-transparent text-center font-mono font-bold text-amber-400 text-xs focus:outline-none"
                            />
                            <span className="text-slate-500 text-[10px]">min</span>
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveEntry(idx, 'up')}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingRoutine.entries.length - 1}
                              onClick={() => handleMoveEntry(idx, 'down')}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(idx)}
                            className="p-1 text-rose-400/80 hover:text-rose-300"
                            title="Remove from routine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {editingRoutine.entries.length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-xs italic">
                      No exercises added yet. Select exercises from the library below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Items from Library Section */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Add from Library
                  </span>
                  <input
                    type="text"
                    value={searchItemTerm}
                    onChange={(e) => setSearchItemTerm(e.target.value)}
                    placeholder="Search exercise..."
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-44"
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
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <span className="text-slate-300 group-hover:text-amber-400 font-medium truncate">
                          {item.name}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 flex-shrink-0">
                          +{item.defaultMinutes}m
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRoutine(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95"
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
