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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#222222]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
            Exercise Library
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-sans">
            Manage your personal library of guitar drills, chord changes, and song exercises.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Exercise</span>
        </button>
      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active vs Archived Selector */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-md border border-[#262626]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setActiveTab('active');
              }}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[#242424] text-white font-medium'
                  : 'text-[#888888] hover:text-white'
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
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-[#242424] text-white font-medium'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Archived ({archivedItems.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter exercises..."
              className="w-full bg-[#141414] border border-[#262626] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#242424] text-white font-medium border border-[#333333]'
                  : 'bg-[#141414] text-[#737373] border border-[#222222] hover:text-[#d4d4d4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-2">
        {displayedList.map((item) => {
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-[#141414] border border-[#222222] hover:border-[#2e2e2e] rounded-lg p-3.5 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('toggle');
                      setExpandedItemId(isExpanded ? null : item.id);
                    }}
                    className="p-1 rounded text-[#737373] hover:text-white transition-colors cursor-pointer"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <ChordText text={item.name} />
                      {item.category && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1f1f1f] text-[#888888]">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.notes && !isExpanded && (
                      <p className="text-xs text-[#666666] truncate max-w-lg mt-0.5 m-0 font-sans">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 font-mono text-xs text-[#888888] bg-[#1a1a1a] px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-[#737373]" />
                    {item.defaultMinutes}m
                  </span>

                  {item.targetBpm && (
                    <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-[#888888] bg-[#1a1a1a] px-2 py-0.5 rounded">
                      <Music className="w-3 h-3 text-[#737373]" />
                      {item.targetBpm} bpm
                    </span>
                  )}

                  {item.videoUrl && (
                    <span className="text-rose-400 p-0.5" title="Video linked">
                      <Video className="w-3.5 h-3.5" />
                    </span>
                  )}

                  {/* Actions for Active Items */}
                  {activeTab === 'active' ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded text-[#737373] hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          duplicateItem(item.id);
                        }}
                        className="p-1.5 rounded text-[#737373] hover:text-white transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          archiveItem(item.id);
                        }}
                        className="p-1.5 rounded text-[#737373] hover:text-amber-400 transition-colors cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Actions for Archived Items */
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('stomp');
                          restoreItem(item.id);
                        }}
                        className="p-1.5 rounded text-[#737373] hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          if (window.confirm(`Permanently delete "${item.name}"?`)) {
                            deleteItemPermanently(item.id);
                          }
                        }}
                        className="p-1.5 rounded text-[#737373] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline Expansion Content */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#1f1f1f] text-xs space-y-2 animate-in fade-in duration-100">
                  {item.notes && (
                    <div className="bg-[#111111] p-2.5 rounded border border-[#222222]">
                      <span className="font-mono text-[#737373] text-[10px] block mb-0.5">
                        Notes
                      </span>
                      <p className="text-[#a3a3a3] leading-relaxed m-0">{item.notes}</p>
                    </div>
                  )}

                  {item.thingsToRemember && (
                    <div className="bg-[#111111] p-2.5 rounded border border-[#222222]">
                      <span className="font-mono text-amber-400 text-[10px] block mb-0.5">
                        Reminders
                      </span>
                      <p className="text-[#d4d4d4] italic m-0">“{item.thingsToRemember}”</p>
                    </div>
                  )}

                  {item.videoUrl && (
                    <div className="text-[11px] text-[#737373] font-mono truncate">
                      <span>Video:</span>{' '}
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline"
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
          <div className="p-8 text-center bg-[#141414] rounded-lg border border-[#222222] text-[#737373] text-xs">
            No exercises match your search or filter criteria.
          </div>
        )}
      </div>

      {/* Item Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-100">
          <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-sm font-semibold text-white m-0">
                {isNew ? 'Create New Exercise' : 'Edit Exercise'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingItem(null);
                }}
                className="p-1 rounded text-[#737373] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block text-[11px] text-[#888888] mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. C ↔ F Chord changes, 1 min"
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Default Duration (mins)
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
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
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
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Metronome BPM (optional)
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
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Video Link (optional)
                  </label>
                  <input
                    type="text"
                    value={editingItem.videoUrl || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#888888] mb-1">
                  Notes
                </label>
                <textarea
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  rows={2}
                  placeholder="Technique tips, finger placements..."
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-400 mb-1">
                  Reminders (Key Cues)
                </label>
                <textarea
                  value={editingItem.thingsToRemember}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, thingsToRemember: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Keep thumb behind fretboard..."
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded p-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-3 px-5 border-t border-[#222222] bg-[#141414] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingItem(null);
                }}
                className="px-3 py-1.5 rounded text-xs text-[#888888] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Exercise</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
