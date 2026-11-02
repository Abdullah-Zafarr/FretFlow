import React, { useState } from 'react';
import {
  Play,
  Pause,
  ListOrdered,
  BookMarked,
  BarChart3,
  Info,
  Settings,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import { soundEngine } from '../utils/audio';

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
  const {
    settings,
    updateSettings,
    isTimerRunning,
    timerSeconds,
    activeItem,
    startTimer,
    pauseTimer,
  } = usePractice();
  const [showTabHelp, setShowTabHelp] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    soundEngine.playMechanicalClick('toggle');
    onTabChange(tab);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rSecs.toString().padStart(2, '0')}`;
  };

  const getHelpContent = (tab: ActiveTab) => {
    switch (tab) {
      case 'practice':
        return {
          title: 'Practice Station',
          body: 'Runs your active routine. Start the countdown, configure the metronome, or review notes and reminders for each exercise.',
        };
      case 'routines':
        return {
          title: 'Routines',
          body: 'Structured practice sequences. Exactly one routine is active at a time. Click "Activate" on any routine to load it.',
        };
      case 'items':
        return {
          title: 'Exercise Library',
          body: 'Your master collection of drills, chords, and song exercises. Create, duplicate, or archive drills at any time.',
        };
      case 'stats':
        return {
          title: 'Practice Statistics',
          body: 'Track your total deliberate practice hours, daily consistency streaks, and exercise time allocation.',
        };
      case 'about':
        return {
          title: 'Guitar Practice Philosophy',
          body: 'Deliberate practice guidelines based on Justin Sandercoe’s methodology: daily short sessions, internalizing rhythm, and tracking 1-minute chord changes.',
        };
    }
  };

  const helpInfo = getHelpContent(currentTab);

  return (
    <header className="sticky top-0 z-40 bg-[#111111]/90 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-7 h-7 rounded-md bg-[#1f1f1f] border border-[#2e2e2e] flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 C18 2 21 8 19 16 C17 22 12 23 12 23 C12 23 7 22 5 16 C3 8 6 2 12 2 Z" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                Guitar
              </span>
              <span className="text-xs text-[#666666] hidden sm:inline">
                Practice Assistant
              </span>
              {isTimerRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" title="Timer is active" />
              )}
            </div>
          </div>

          {/* Minimalist Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => handleTabClick('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentTab === 'practice'
                  ? 'bg-[#222222] text-white font-medium'
                  : 'text-[#888888] hover:text-[#d4d4d4]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('routines')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentTab === 'routines'
                  ? 'bg-[#222222] text-white font-medium'
                  : 'text-[#888888] hover:text-[#d4d4d4]'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Routines</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('items')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentTab === 'items'
                  ? 'bg-[#222222] text-white font-medium'
                  : 'text-[#888888] hover:text-[#d4d4d4]'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Exercises</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentTab === 'stats'
                  ? 'bg-[#222222] text-white font-medium'
                  : 'text-[#888888] hover:text-[#d4d4d4]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Stats</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentTab === 'about'
                  ? 'bg-[#222222] text-white font-medium'
                  : 'text-[#888888] hover:text-[#d4d4d4]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Audio sound toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                updateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                settings.soundEnabled
                  ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#d4d4d4] hover:text-white'
                  : 'border-[#3f2222] bg-[#221414] text-[#e06666]'
              }`}
              title={settings.soundEnabled ? 'Audio: On' : 'Audio: Muted'}
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Help / Guide Popover Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowTabHelp(!showTabHelp);
              }}
              className="p-1.5 rounded-md border border-[#2e2e2e] bg-[#1a1a1a] text-[#888888] hover:text-white transition-colors cursor-pointer"
              title="Information on this tab"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Calibration / Backup Modal Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                onOpenSettings();
              }}
              className="p-1.5 rounded-md border border-[#2e2e2e] bg-[#1a1a1a] text-[#888888] hover:text-white transition-colors cursor-pointer"
              title="Settings & Backup"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Selector */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[#1f1f1f] text-xs overflow-x-auto gap-1">
          {(['practice', 'routines', 'items', 'stats', 'about'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-1.5 rounded-md capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentTab === tab
                  ? 'bg-[#222222] text-white font-medium'
                  : 'text-[#888888] hover:text-[#d4d4d4]'
              }`}
            >
              <span>{tab === 'about' ? 'Guide' : tab === 'items' ? 'Exercises' : tab}</span>
              {tab === 'practice' && isTimerRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Minimal Persistent Mini-Timer Bar when user navigates away from Practice tab */}
        {currentTab !== 'practice' && (isTimerRunning || timerSeconds > 0) && activeItem && (
          <div className="py-2 px-3 my-1.5 bg-[#171717] border border-[#292929] rounded-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-amber-400 animate-ping' : 'bg-[#555555]'}`} />
              <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="font-mono font-bold text-amber-400 flex-shrink-0">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[#a3a3a3] truncate max-w-xs hidden sm:inline">
                • {activeItem.name}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
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
                className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#303030] text-[#e5e5e5] text-[11px] font-medium cursor-pointer"
              >
                {isTimerRunning ? <Pause className="w-3 h-3 inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
                <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('practice')}
                className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 ml-1 cursor-pointer"
              >
                <span>To Player</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Popover */}
      {showTabHelp && (
        <div className="bg-[#171717] border-t border-b border-[#262626] p-3 px-4 sm:px-6 text-xs text-[#a3a3a3]">
          <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-white text-xs mb-0.5">
                {helpInfo.title}
              </div>
              <p className="leading-relaxed text-[#888888] max-w-2xl m-0">{helpInfo.body}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowTabHelp(false);
              }}
              className="text-[#666666] hover:text-[#e5e5e5] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
