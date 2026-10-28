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
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.name.trim()) return;
    saveItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Exercise Library</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and customize your reusable drills, chord changes, and song exercises.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Exercise</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active vs Archived Sub-tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'active'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Items ({activeItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'archived'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Archived ({archivedItems.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter exercises..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {displayedList.map((item) => {
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-sm transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left details */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <ChordText text={item.name} />
                      {item.category && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.notes && !isExpanded && (
                      <p className="text-xs text-slate-500 truncate max-w-xl mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {item.defaultMinutes} MIN
                  </span>

                  {item.targetBpm && (
                    <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Music className="w-3 h-3 text-amber-500" />
                      {item.targetBpm} BPM
                    </span>
                  )}

                  {item.videoUrl && (
                    <span className="p-1 text-rose-400" title="Video linked">
                      <Video className="w-4 h-4" />
                    </span>
                  )}

                  {/* Actions for Active Items */}
                  {activeTab === 'active' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Duplicate Item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => archiveItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-400 transition-colors"
                        title="Archive Item"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    /* Actions for Archived Items */
                    <>
                      <button
                        type="button"
                        onClick={() => restoreItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 hover:text-emerald-400 text-slate-300 transition-colors"
                        title="Restore to Active"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Permanently delete "${item.name}"?`)) {
                            deleteItemPermanently(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-500 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline Expansion Content */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
                  {item.notes && (
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Notes:
                      </span>
                      <p className="text-slate-300 italic">{item.notes}</p>
                    </div>
                  )}

                  {item.thingsToRemember && (
                    <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Things to Remember:
                      </span>
                      <p className="text-amber-200 font-medium">“{item.thingsToRemember}”</p>
                    </div>
                  )}

                  {item.videoUrl && (
                    <div className="text-slate-400 text-[11px] truncate">
                      <span className="font-semibold text-slate-500">Video:</span>{' '}
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
          <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No exercises match your search or filter criteria.
          </div>
        )}
      </div>

      {/* Item Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
              <h3 className="text-base font-bold text-white">
                {isNew ? 'Create New Exercise' : 'Edit Exercise'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. C ↔ F Chord changes, 1 min"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
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
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Target Metronome BPM (optional)
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Video / YouTube Link (optional)
                  </label>
                  <input
                    type="text"
                    value={editingItem.videoUrl || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  rows={2}
                  placeholder="Technique tips, finger placements..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Things to Remember (Key cues during practice)
                </label>
                <textarea
                  value={editingItem.thingsToRemember}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, thingsToRemember: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Speak random stuff so the guitar goes on autopilot..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95"
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
