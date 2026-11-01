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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#2d251d]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-500 mb-1">
            DELIBERATE PRACTICE EXERCISE ARCHIVE
          </div>
          <h2 className="text-2xl font-serif font-black text-[#f7f3ec] tracking-tight m-0">
            Exercise Catalog
          </h2>
          <p className="text-xs text-[#9c9080] mt-1 font-mono">
            Browse, customize, and archive drills, chord change benchmarks, and song studies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Catalog Entry</span>
        </button>
      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active vs Archived Selector */}
          <div className="flex items-center gap-1 bg-[#141210] p-1 rounded-lg border border-[#332c24]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setActiveTab('active');
              }}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded cursor-pointer transition-colors ${
                activeTab === 'active'
                  ? 'bg-amber-500 text-[#141210] shadow-sm'
                  : 'text-[#8c8070] hover:text-[#f0ebe1]'
              }`}
            >
              ACTIVE DRILLS ({activeItems.length})
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setActiveTab('archived');
              }}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded cursor-pointer transition-colors ${
                activeTab === 'archived'
                  ? 'bg-amber-500 text-[#141210] shadow-sm'
                  : 'text-[#8c8070] hover:text-[#f0ebe1]'
              }`}
            >
              ARCHIVE VAULT ({archivedItems.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#7d7262] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog index..."
              className="w-full bg-[#141210] border border-[#332c24] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f0ebe1] font-mono placeholder-[#665c4e] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Index Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded font-mono text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#29221b] text-amber-400 border border-[#4d3f2e] shadow-inner'
                  : 'bg-[#141210] text-[#7d7262] border border-[#2d251d] hover:border-[#42372c]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Index Card Catalog Items */}
      <div className="space-y-3">
        {displayedList.map((item) => {
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-[#1c1916] border border-[#383025] hover:border-[#4f4233] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all relative"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left details */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMechanicalClick('toggle');
                      setExpandedItemId(isExpanded ? null : item.id);
                    }}
                    className="p-1 rounded text-[#7d7262] hover:text-[#f0ebe1] transition-colors cursor-pointer"
                    title={isExpanded ? 'Collapse' : 'Expand Index'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <div className="font-serif font-black text-sm sm:text-base text-[#f7f3ec] flex items-center gap-2">
                      <ChordText text={item.name} />
                      {item.category && (
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#26201a] text-amber-400 border border-[#3d3326]">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.notes && !isExpanded && (
                      <p className="text-xs text-[#8c8070] truncate max-w-xl mt-0.5 font-sans">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[#a39786] bg-[#141210] px-2.5 py-1 rounded border border-[#2d251d]">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {item.defaultMinutes} MIN
                  </span>

                  {item.targetBpm && (
                    <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-[#a39786] bg-[#141210] px-2.5 py-1 rounded border border-[#2d251d]">
                      <Music className="w-3.5 h-3.5 text-amber-500" />
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
                        className="p-1.5 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#382f23] text-[#c9bea8] transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          duplicateItem(item.id);
                        }}
                        className="p-1.5 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#382f23] text-[#c9bea8] transition-colors cursor-pointer"
                        title="Duplicate Item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          archiveItem(item.id);
                        }}
                        className="p-1.5 rounded bg-[#241e17] hover:bg-[#2e261d] border border-[#382f23] text-[#7d7262] hover:text-amber-400 transition-colors cursor-pointer"
                        title="Move to Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    /* Actions for Archived Items */
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('stomp');
                          restoreItem(item.id);
                        }}
                        className="p-1.5 rounded bg-[#241e17] hover:bg-emerald-950 hover:text-emerald-400 border border-[#382f23] text-[#c9bea8] transition-colors cursor-pointer"
                        title="Restore to Active Catalog"
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
                        className="p-1.5 rounded bg-[#241e17] hover:bg-[#331717] border border-[#382f23] text-[#7d7262] hover:text-[#e07b7b] transition-colors cursor-pointer"
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
                <div className="mt-3 pt-3 border-t border-[#2d251d] text-xs space-y-2 animate-in fade-in duration-100">
                  {item.notes && (
                    <div className="bg-[#141210] p-3 rounded-lg border border-[#2d251d]">
                      <span className="font-mono font-bold text-[#8c8070] uppercase tracking-wider text-[10px] block mb-1">
                        PRACTICE OBSERVATIONS:
                      </span>
                      <p className="text-[#c9bea8] font-sans leading-relaxed m-0">{item.notes}</p>
                    </div>
                  )}

                  {item.thingsToRemember && (
                    <div className="bg-[#241e17] p-3 rounded-lg border border-[#3d3326]">
                      <span className="font-mono font-bold text-amber-500 uppercase tracking-wider text-[10px] block mb-1">
                        KEY DELIBERATE CUES:
                      </span>
                      <p className="text-amber-200 font-serif italic m-0">“{item.thingsToRemember}”</p>
                    </div>
                  )}

                  {item.videoUrl && (
                    <div className="text-[#8c8070] text-[11px] font-mono truncate">
                      <span className="font-semibold text-[#665c4e]">LESSON VIDEO:</span>{' '}
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
          <div className="p-10 text-center bg-[#191613] rounded-xl border border-[#2d251d] text-[#7d7262] text-xs font-mono">
            No catalog drills match the active query.
          </div>
        )}
      </div>

      {/* Item Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150">
          <div className="bg-[#1c1916] border-2 border-[#4f4233] rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="absolute top-2.5 left-2.5 screw-head" />
            <div className="absolute top-2.5 right-2.5 screw-head" />

            <div className="flex items-center justify-between p-4 px-6 border-b border-[#2d251d] bg-[#141210]">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#f5f1ea] m-0">
                {isNew ? 'REGISTER NEW CATALOG DRILL' : 'EDIT CATALOG DRILL'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingItem(null);
                }}
                className="p-1 rounded text-[#8c8070] hover:text-[#f5f1ea] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                  EXERCISE / DRILL NAME
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. C ↔ F Chord changes, 1 min"
                  className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    DEFAULT TARGET (MINS)
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
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={editingItem.category || 'Technique'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value as ItemCategory,
                      })
                    }
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
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
                  <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    METRONOME BPM (OPTIONAL)
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
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs font-mono text-[#f5f1ea] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    VIDEO LINK (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={editingItem.videoUrl || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                  PRACTICE LOG OBSERVATIONS
                </label>
                <textarea
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  rows={2}
                  placeholder="Technique tips, finger placements..."
                  className="w-full bg-[#141210] border border-[#382f23] rounded-lg p-2.5 text-xs text-[#f5f1ea] font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-mono font-bold uppercase tracking-wider text-amber-500 mb-1">
                  DELIBERATE PRACTICE CUES (REMINDERS)
                </label>
                <textarea
                  value={editingItem.thingsToRemember}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, thingsToRemember: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Speak random stuff so the chord shape goes on autopilot..."
                  className="w-full bg-[#141210] border border-[#382f23] rounded-lg p-2.5 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#2d251d] bg-[#141210] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-[#8c8070] hover:text-[#f0ebe1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save to Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
