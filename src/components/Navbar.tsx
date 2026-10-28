import React, { useState } from 'react';
import {
  Play,
  ListOrdered,
  BookMarked,
  BarChart3,
  Info,
  Settings,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';

export type ActiveTab = 'practice' | 'routines' | 'items' | 'stats' | 'about';

interface NavbarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenSettings,
}) => {
  const { settings, updateSettings } = usePractice();
  const [showTabHelp, setShowTabHelp] = useState(false);

  const getHelpContent = (tab: ActiveTab) => {
    switch (tab) {
      case 'practice':
        return {
          title: 'Practice Player Help',
          body: 'The Practice tab runs your current active routine. Click Play to start the countdown, toggle the metronome or video assistant, and review notes/cues. You can complete exercises in or out of order.',
        };
      case 'routines':
        return {
          title: 'Routines Manager Help',
          body: 'Manage your structured practice routines. Exactly one routine is active at a time. Click "Activate" to switch active routine, or "Edit" to reorder exercises and change minutes.',
        };
      case 'items':
        return {
          title: 'Exercise Library Help',
          body: 'Browse your reusable drills, chord changes, and song exercises. Create new items, duplicate variations, or archive retired drills.',
        };
      case 'stats':
        return {
          title: 'Practice Statistics Help',
          body: 'Review your total practice hours, daily bar charts, exercise time breakdown, and daily streaks. You can also log offline practice done away from the app.',
        };
      case 'about':
        return {
          title: 'About JustinGuitar Practice Assistant',
          body: 'Deliberate practice guidelines based on JustinGuitar methodology: consistent daily short sessions, internalizing rhythm, and targeting weaknesses.',
        };
    }
  };

  const helpInfo = getHelpContent(currentTab);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/10">
              <span className="text-lg">🎸</span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                JustinGuitar Inspired
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white m-0">
                MY PRACTICE ASSISTANT
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => onTabChange('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentTab === 'practice'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('routines')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentTab === 'routines'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Routines</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('items')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentTab === 'items'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Items</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentTab === 'stats'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Stats</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentTab === 'about'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Audio sound toggle */}
            <button
              type="button"
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`p-2 rounded-xl border ${
                settings.soundEnabled
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-400'
              } transition-colors`}
              title={settings.soundEnabled ? 'Sound is on' : 'Sound is muted'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Tab Info / Help Icon (Section 1 ⓘ) */}
            <button
              type="button"
              onClick={() => setShowTabHelp(!showTabHelp)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title="Help on this tab"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings & Backup Modal Toggle */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title="Backup, Restore & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-850 text-xs font-bold overflow-x-auto gap-1">
          {(['practice', 'routines', 'items', 'stats', 'about'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                currentTab === tab
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Info Popover (Section 1 ⓘ Icon) */}
      {showTabHelp && (
        <div className="bg-slate-900 border border-amber-500/30 p-4 px-5 text-xs text-slate-300 shadow-2xl relative animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
            <div>
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                {helpInfo.title}
              </div>
              <p className="leading-relaxed">{helpInfo.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTabHelp(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
