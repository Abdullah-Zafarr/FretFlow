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
          title: 'Practice Station Guide',
          body: 'The Practice tab runs your current active routine. Click the Footswitch to run the deliberate practice timer, adjust the analog metronome dial, or follow video guidance. Take notes directly on the console scribble tape.',
        };
      case 'routines':
        return {
          title: 'Routine Rack Guide',
          body: 'Structured practice sequences. Exactly one routine is active at a time on the main bench. Activate a routine to load its sequence or edit item durations and ordering.',
        };
      case 'items':
        return {
          title: 'Exercise Catalog Guide',
          body: 'Your master archive of guitar drills, chord changes, and song exercises. Build custom variations, archive completed goals, or log one-minute chord benchmarks.',
        };
      case 'stats':
        return {
          title: 'Studio Logbook Guide',
          body: 'Historical practice telemetry, streak meters, cumulative deliberate hours, and category breakdown. You can also log analog offline practice sessions.',
        };
      case 'about':
        return {
          title: 'JustinGuitar Methodology',
          body: 'Core deliberate practice principles: daily 15-30 minute focused blocks, physical repetition, tracking chord changes per minute, and playing with clean rhythm.',
        };
    }
  };

  const helpInfo = getHelpContent(currentTab);

  return (
    <header className="sticky top-0 z-40 bg-[#1c1915] border-b border-[#2d2720] shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
      {/* Top brushed metal highlight rail */}
      <div className="h-[2px] bg-gradient-to-r from-[#383127] via-[#5c5243] to-[#383127] w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Faceplate Badge */}
          <div className="flex items-center gap-3 select-none">
            {/* Chassis Mounting Screw */}
            <div className="screw-head hidden sm:block" title="Chassis screw" />

            {/* Vintage Pick Emblem */}
            <div className="w-9 h-9 rounded-lg bg-[#27221c] border border-[#443a2f] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
              <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 C18 2 21 8 19 16 C17 22 12 23 12 23 C12 23 7 22 5 16 C3 8 6 2 12 2 Z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-500 font-bold">
                  STUDIO WORKBENCH
                </span>
                {/* Faceted Fender Jewel Pilot Lamp */}
                <div
                  className={`jewel-lamp ${isTimerRunning ? 'jewel-lamp-active' : 'jewel-lamp-off'}`}
                  title={isTimerRunning ? 'Tube Amp Engaged • Practice Timer Active' : 'Standby Mode'}
                />
              </div>
              <h1 className="text-base sm:text-lg font-serif font-black tracking-tight text-[#f5f1ea] m-0 leading-none">
                JUSTINGUITAR
              </h1>
            </div>
          </div>

          {/* Analog Gear Selector Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#141210] p-1.5 rounded-lg border border-[#332c24] shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabClick('practice')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                currentTab === 'practice'
                  ? 'bg-[#2d261e] text-amber-400 border border-[#524536] shadow-[0_1px_3px_rgba(0,0,0,0.5)] font-bold'
                  : 'text-[#9c9182] hover:text-[#f0eae0]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Station</span>
              {isTimerRunning && currentTab !== 'practice' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('routines')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                currentTab === 'routines'
                  ? 'bg-[#2d261e] text-amber-400 border border-[#524536] shadow-[0_1px_3px_rgba(0,0,0,0.5)] font-bold'
                  : 'text-[#9c9182] hover:text-[#f0eae0]'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Routines Rack</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('items')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                currentTab === 'items'
                  ? 'bg-[#2d261e] text-amber-400 border border-[#524536] shadow-[0_1px_3px_rgba(0,0,0,0.5)] font-bold'
                  : 'text-[#9c9182] hover:text-[#f0eae0]'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('stats')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                currentTab === 'stats'
                  ? 'bg-[#2d261e] text-amber-400 border border-[#524536] shadow-[0_1px_3px_rgba(0,0,0,0.5)] font-bold'
                  : 'text-[#9c9182] hover:text-[#f0eae0]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Logbook</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('about')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                currentTab === 'about'
                  ? 'bg-[#2d261e] text-amber-400 border border-[#524536] shadow-[0_1px_3px_rgba(0,0,0,0.5)] font-bold'
                  : 'text-[#9c9182] hover:text-[#f0eae0]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Method</span>
            </button>
          </nav>

          {/* Right Hardware Panel Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio sound toggle with physical toggle sound */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                updateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-[#25201a] border-[#443a2f] text-amber-400 hover:border-amber-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                  : 'bg-[#221515] border-[#4f2a2a] text-[#d67b7b]'
              }`}
              title={settings.soundEnabled ? 'Speaker: Enabled (Click to Mute)' : 'Speaker: Muted'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Help / Guide Popover Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowTabHelp(!showTabHelp);
              }}
              className="p-2 rounded-lg bg-[#25201a] border border-[#443a2f] text-[#9c9182] hover:text-amber-400 hover:border-[#5a4d3e] transition-colors cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
              title="Help & Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Calibration / Backup Modal Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                onOpenSettings();
              }}
              className="p-2 rounded-lg bg-[#25201a] border border-[#443a2f] text-[#9c9182] hover:text-amber-400 hover:border-[#5a4d3e] transition-colors cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
              title="Calibration, Backup & Data"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Chassis Mounting Screw */}
            <div className="screw-head hidden sm:block ml-1" title="Chassis screw" />
          </div>
        </div>

        {/* Mobile Navigation Selector */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[#2d2720] text-xs font-semibold overflow-x-auto gap-1">
          {(['practice', 'routines', 'items', 'stats', 'about'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentTab === tab
                  ? 'bg-[#2d261e] text-amber-400 border border-[#524536] font-bold'
                  : 'text-[#9c9182] hover:text-[#f0eae0]'
              }`}
            >
              <span>{tab}</span>
              {tab === 'practice' && isTimerRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Floating Tape Strip Mini-Timer Bar when user navigates away from Practice tab */}
        {currentTab !== 'practice' && (isTimerRunning || timerSeconds > 0) && activeItem && (
          <div className="py-2 px-3.5 my-1.5 bg-[#171411] border border-[#3d3429] rounded-lg flex items-center justify-between text-xs shadow-lg">
            <div className="flex items-center gap-2.5 truncate">
              <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-amber-400 animate-ping' : 'bg-[#5c5243]'}`} />
              <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="font-mono font-bold text-amber-400 flex-shrink-0 tracking-wide">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[#c7bdb0] truncate max-w-xs hidden sm:inline font-medium">
                — {activeItem.name}
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
                className="px-2.5 py-1 rounded bg-[#2a241d] hover:bg-[#383027] border border-[#4a3f31] text-[#f2eee7] text-[11px] font-bold cursor-pointer"
              >
                {isTimerRunning ? <Pause className="w-3 h-3 inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
                <span>{isTimerRunning ? 'Halt' : 'Resume'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('practice')}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 ml-1 cursor-pointer"
              >
                <span>To Bench</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hardware Documentation Popover */}
      {showTabHelp && (
        <div className="bg-[#191613] border-t border-b border-[#3d3429] p-4 px-6 text-xs text-[#d1c7b8] shadow-2xl relative">
          <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
            <div>
              <div className="font-bold text-amber-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                {helpInfo.title}
              </div>
              <p className="leading-relaxed text-[#bcb1a1] max-w-2xl">{helpInfo.body}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playMechanicalClick('toggle');
                setShowTabHelp(false);
              }}
              className="text-[#8c8172] hover:text-[#f2eee7] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
