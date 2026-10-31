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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#2d251d]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-500 mb-1">
            STUDIO WORKBENCH SEQUENCE PRESETS
          </div>
          <h2 className="text-2xl font-serif font-black text-[#f7f3ec] tracking-tight m-0">
            Routines Rack
          </h2>
          <p className="text-xs text-[#9c9080] mt-1 font-mono">
            Assemble drills into deliberate daily training blocks. Exactly one sequence is mounted on the bench at a time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Sequence</span>
        </button>
      </div>

      {/* Two Column Layout: Active Routine (Left) & Inactive Routines (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Current Active Routine */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="jewel-lamp jewel-lamp-active" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 m-0">
              CURRENTLY MOUNTED ON BENCH
            </h3>
          </div>

          {activeRoutine ? (
            <div className="bg-[#1c1916] border-2 border-[#4f4233] rounded-xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.6)] relative">
              <div className="absolute top-2.5 right-2.5 screw-head" />

              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#2d251d]">
                <div>
                  <h4 className="text-xl font-serif font-black text-[#f9f6f0] m-0">
                    {activeRoutine.name}
                  </h4>
                  {activeRoutine.description && (
                    <p className="text-xs text-[#a39786] mt-1 font-sans leading-relaxed">
                      {activeRoutine.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2.5 text-xs font-mono font-semibold text-[#cfc5b6]">
                    <span className="flex items-center gap-1.5 bg-[#141210] px-2.5 py-1 rounded border border-[#2d251d]">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {calculateTotalMinutes(activeRoutine.entries)} MINS TOTAL
                    </span>
                    <span>•</span>
                    <span>{activeRoutine.entries.length} Drills</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(activeRoutine)}
                    className="p-2 rounded-lg bg-[#25201a] hover:bg-[#302922] border border-[#3d3326] text-[#c9bea8] hover:text-[#f0ebe1] transition-colors cursor-pointer"
                    title="Edit Sequence"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('stomp');
                      onSwitchToPractice();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs transition-transform active:translate-y-0.5 shadow-md cursor-pointer"
                    title="Open in Practice Station"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Engage Bench</span>
                  </button>
                </div>
              </div>

              {/* Items in active routine */}
              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7d7262] px-1">
                  SEQUENCE EXERCISES
                </div>
                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {activeRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#141210] border border-[#2d251d] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded bg-[#241e17] text-[#c9bea8] font-mono flex items-center justify-center text-[10px] font-bold border border-[#3d3326]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-[#f0ebe1] truncate">
                            <ChordText text={item.name} />
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 bg-[#241e17] px-2 py-0.5 rounded border border-[#3d3326] flex-shrink-0">
                          {entry.minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#1c1916] rounded-xl border border-[#383025] text-[#8c8070] text-xs font-mono">
              No routine active. Select one from the saved sequences below.
            </div>
          )}
        </div>

        {/* Right Column: Inactive Routines */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8c8070] m-0">
              SAVED PRESETS ARCHIVE ({inactiveRoutines.length})
            </h3>
          </div>

          <div className="space-y-3">
            {inactiveRoutines.map((routine) => {
              const totalMins = calculateTotalMinutes(routine.entries);
              return (
                <div
                  key={routine.id}
                  className="bg-[#191613] border border-[#332c23] rounded-xl p-4 shadow-md hover:border-[#473d31] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-serif font-bold text-[#e8e2d8] m-0">
                        {routine.name}
                      </h4>
                      {routine.description && (
                        <p className="text-xs text-[#8c8070] mt-0.5 line-clamp-1 font-sans">
                          {routine.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2.5 mt-2 text-xs font-mono text-[#a39786]">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Clock className="w-3 h-3" />
                          {totalMins} MINS
                        </span>
                        <span>•</span>
                        <span>{routine.entries.length} Drills</span>
                      </div>
                    </div>

                    {/* Action buttons: Activate (+), Edit, Delete */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('stomp');
                          activateRoutine(routine.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#27211b] hover:bg-emerald-700 text-emerald-400 hover:text-white border border-[#3d3326] font-mono font-bold text-xs transition-colors shadow-sm cursor-pointer"
                        title="Mount Routine to Bench"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mount</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(routine)}
                        className="p-1.5 rounded-lg bg-[#241e17] hover:bg-[#2e261d] border border-[#382f23] text-[#c9bea8] transition-colors cursor-pointer"
                        title="Edit Routine"
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
                        className="p-1.5 rounded-lg bg-[#241e17] hover:bg-[#331717] border border-[#382f23] text-[#7d7262] hover:text-[#e07b7b] transition-colors cursor-pointer"
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
              <div className="p-8 text-center bg-[#191613] rounded-xl border border-[#2d251d] text-[#7d7262] text-xs font-mono">
                No archived routines. Use "New Sequence" above to construct practice variations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Routine Editor Modal */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150">
          <div className="bg-[#1c1916] border-2 border-[#4f4233] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="absolute top-2.5 left-2.5 screw-head" />
            <div className="absolute top-2.5 right-2.5 screw-head" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#2d251d] bg-[#141210]">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#f5f1ea] m-0">
                  {isNewRoutine ? 'CONSTRUCT PRACTICE SEQUENCE' : 'EDIT PRACTICE SEQUENCE'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingRoutine(null);
                }}
                className="p-1 rounded text-[#8c8070] hover:text-[#f5f1ea] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Routine metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    SEQUENCE NAME
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.name}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, name: e.target.value })
                    }
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Daily Warmup & Barre Chords"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    SESSION FOCUS / OBJECTIVE
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.description || ''}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, description: e.target.value })
                    }
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-sans focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Clean chord changes and finger independence"
                  />
                </div>
              </div>

              {/* Routine Total Minutes Banner */}
              <div className="bg-[#141210] border border-[#2d251d] rounded-lg p-3 flex items-center justify-between text-xs">
                <span className="text-[#8c8070] font-mono">Calculated Routine Duration:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {calculateTotalMinutes(editingRoutine.entries)} MINS
                </span>
              </div>

              {/* Entries List with Reorder & Duration Controls */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070]">
                  ROSTER OF EXERCISES ({editingRoutine.entries.length})
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editingRoutine.entries.map((entry, idx) => {
                    const item = items.find((i) => i.id === entry.itemId);
                    if (!item) return null;

                    return (
                      <div
                        key={idx}
                        className="bg-[#141210] border border-[#2d251d] rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        {/* Order & Title */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-[#241e17] text-[#c9bea8] font-mono flex items-center justify-center text-[10px] font-bold border border-[#382f23]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-[#f0ebe1] truncate">
                            {item.name}
                          </span>
                        </div>

                        {/* Minutes adjustment + Move + Remove */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-[#1a1714] border border-[#382f23] rounded px-2 py-0.5">
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
                            <span className="text-[#7d7262] text-[10px] font-mono">min</span>
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveEntry(idx, 'up')}
                              className="p-1 text-[#8c8070] hover:text-[#f0ebe1] disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingRoutine.entries.length - 1}
                              onClick={() => handleMoveEntry(idx, 'down')}
                              className="p-1 text-[#8c8070] hover:text-[#f0ebe1] disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(idx)}
                            className="p-1 text-[#a85050] hover:text-rose-400 cursor-pointer"
                            title="Remove drill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {editingRoutine.entries.length === 0 && (
                    <div className="p-4 text-center text-[#7d7262] text-xs font-mono italic">
                      No exercises enrolled yet. Select drills from the catalog below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Items from Catalog Section */}
              <div className="border-t border-[#2d251d] pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070]">
                    ADD FROM EXERCISE CATALOG
                  </span>
                  <input
                    type="text"
                    value={searchItemTerm}
                    onChange={(e) => setSearchItemTerm(e.target.value)}
                    placeholder="Search drill..."
                    className="bg-[#141210] border border-[#382f23] rounded px-2.5 py-1 text-xs text-[#f0ebe1] font-mono focus:outline-none focus:border-amber-500 w-44"
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
                        className="p-2 rounded-lg bg-[#141210] hover:bg-[#252019] border border-[#2d251d] hover:border-[#42372a] text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <span className="text-[#d6cdbe] group-hover:text-amber-400 font-medium truncate">
                          {item.name}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[#7d7262] flex-shrink-0">
                          +{item.defaultMinutes}m
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2d251d] bg-[#141210] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingRoutine(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-[#8c8070] hover:text-[#f0ebe1] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Sequence</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
