import React, { useState } from 'react';
import {
  Plus,
  Search,
  Copy,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  Video,
  Music,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import type { PracticeItem, ItemCategory } from '../types/practice';
import { ChordText } from './ChordText';
import { soundEngine } from '../utils/audio';

const CATEGORIES: ItemCategory[] = [
  'Technique',
  'Chords',
  'Rhythm',
  'Songs',
  'Theory',
  'Warmup',
];

export const ItemsTab: React.FC = () => {
  const {
    items,
    saveItem,
    duplicateItem,
    archiveItem,
    restoreItem,
    deleteItemPermanently,
  } = usePractice();

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Editor Modal
  const [editingItem, setEditingItem] = useState<PracticeItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Filter items
  const activeItems = items.filter((i) => !i.archived);
  const archivedItems = items.filter((i) => i.archived);

  const displayedList = (activeTab === 'active' ? activeItems : archivedItems).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenNew = () => {
    soundEngine.playMechanicalClick('stomp');
    const newItem: PracticeItem = {
      id: 'item-' + Date.now(),
      name: '',
      defaultMinutes: 5,
      notes: '',
      thingsToRemember: '',
      category: 'Technique',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingItem(newItem);
    setIsNew(true);
  };

  const handleOpenEdit = (item: PracticeItem) => {
    soundEngine.playMechanicalClick('toggle');
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleSaveItem = () => {
    soundEngine.playMechanicalClick('stomp');
    if (!editingItem || !editingItem.name.trim()) return;
    saveItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight m-0">
            Exercise Library
          </h2>
          <p className="text-sm text-neutral-400 mt-1.5 font-sans">
            Manage your personal library of guitar drills, chord changes, and song exercises.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Exercise</span>
        </button>
      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active vs Archived Selector */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setActiveTab('active');
              }}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-md transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[#262626] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white font-medium'
              }`}
            >
              Active ({activeItems.length})
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setActiveTab('archived');
              }}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-md transition-colors cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-[#262626] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white font-medium'
              }`}
            >
              Archived ({archivedItems.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter exercises..."
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg pl-9 pr-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer font-medium ${
                selectedCategory === cat
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                  : 'bg-[#161616] text-neutral-300 border border-[#2a2a2a] hover:bg-[#222222] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-2.5">
        {displayedList.map((item) => {
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-[#141414] border border-[#242424] hover:border-[#333333] rounded-xl p-4 sm:p-5 transition-all shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('toggle');
                      setExpandedItemId(isExpanded ? null : item.id);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-[17px] font-bold text-white flex flex-wrap items-center gap-2.5 tracking-tight">
                      <ChordText text={item.name} />
                      {item.category && (
                        <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#202020] text-neutral-300 border border-[#333333]">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.notes && !isExpanded && (
                      <p className="text-[13px] sm:text-sm text-neutral-400 truncate max-w-xl mt-1 m-0 font-sans leading-normal">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1.5 font-mono text-xs sm:text-[13px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {item.defaultMinutes}m
                  </span>

                  {item.targetBpm && (
                    <span className="hidden sm:flex items-center gap-1.5 font-mono text-xs sm:text-[13px] font-semibold text-neutral-200 bg-[#222222] border border-[#383838] px-2.5 py-1 rounded-md">
                      <Music className="w-3.5 h-3.5 text-neutral-400" />
                      {item.targetBpm} bpm
                    </span>
                  )}

                  {item.videoUrl && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-md" title="Video linked">
                      <Video className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden md:inline">Video</span>
                    </span>
                  )}

                  {/* Actions for Active Items */}
                  {activeTab === 'active' ? (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          duplicateItem(item.id);
                        }}
                        className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          archiveItem(item.id);
                        }}
                        className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Actions for Archived Items */
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('stomp');
                          restoreItem(item.id);
                        }}
                        className="p-2 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          if (window.confirm(`Permanently delete "${item.name}"?`)) {
                            deleteItemPermanently(item.id);
                          }
                        }}
                        className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline Expansion Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#222222] space-y-3 animate-in fade-in duration-100">
                  {item.notes && (
                    <div className="bg-[#101010] p-3.5 rounded-lg border border-[#262626]">
                      <span className="font-mono text-neutral-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                        Notes & Guidance
                      </span>
                      <p className="text-sm text-neutral-200 leading-relaxed m-0 font-sans">{item.notes}</p>
                    </div>
                  )}

                  {item.thingsToRemember && (
                    <div className="bg-[#101010] p-3.5 rounded-lg border border-[#262626]">
                      <span className="font-mono text-amber-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                        Key Reminders
                      </span>
                      <p className="text-sm text-amber-200/90 italic m-0 font-sans">“{item.thingsToRemember}”</p>
                    </div>
                  )}

                  {item.videoUrl && (
                    <div className="text-xs text-neutral-400 font-mono truncate pt-1">
                      <span className="font-semibold text-neutral-300">Video:</span>{' '}
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        {item.videoUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="p-10 text-center bg-[#141414] rounded-xl border border-[#242424] text-neutral-400 text-sm">
            No exercises match your search or filter criteria.
          </div>
        )}
      </div>

      {/* Item Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-100">
          <div className="bg-[#141414] border border-[#2c2c2c] rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#242424]">
              <h3 className="text-base font-bold text-white m-0">
                {isNew ? 'Create New Exercise' : 'Edit Exercise'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingItem(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. C ↔ F Chord changes, 1 min"
                  className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={editingItem.defaultMinutes}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        defaultMinutes: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editingItem.category || 'Technique'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value as ItemCategory,
                      })
                    }
                    className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Metronome BPM (opt)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="260"
                    value={editingItem.targetBpm || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        targetBpm: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 80"
                    className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Video Link (opt)
                  </label>
                  <input
                    type="text"
                    value={editingItem.videoUrl || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Notes & Technique
                </label>
                <textarea
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  rows={2}
                  placeholder="Technique tips, finger placements..."
                  className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg p-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                  Key Reminders (Cues)
                </label>
                <textarea
                  value={editingItem.thingsToRemember}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, thingsToRemember: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Keep thumb behind fretboard..."
                  className="w-full bg-[#101010] border border-[#2c2c2c] rounded-lg p-3 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-4 px-6 border-t border-[#242424] bg-[#121212] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Exercise</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
