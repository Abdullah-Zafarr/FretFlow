import React, { useState, useEffect } from 'react';
import { PracticeProvider } from './context/PracticeContext';
import { usePractice } from './context/usePractice';
import { Navbar, type ActiveTab } from './components/Navbar';
import { PracticeTab } from './components/PracticeTab';
import { RoutinesTab } from './components/RoutinesTab';
import { ItemsTab } from './components/ItemsTab';
import { StatsTab } from './components/StatsTab';
import { AboutTab } from './components/AboutTab';
import { BackupModal } from './components/BackupModal';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('practice');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const { isTimerRunning, timerSeconds, activeItem } = usePractice();

  // Dynamically update document title with live countdown
  // Visible right on the browser tab even when the user is on other sites/tabs
  useEffect(() => {
    if (isTimerRunning && activeItem) {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      document.title = `[${formatted}] ${activeItem.name} — JustinGuitar`;
    } else if (timerSeconds === 0 && activeItem) {
      document.title = `[COMPLETED] ${activeItem.name} — JustinGuitar`;
    } else {
      document.title = 'JustinGuitar — Practice Assistant';
    }
  }, [isTimerRunning, timerSeconds, activeItem]);

  return (
    <div className="min-h-screen bg-[#141210] text-[#f2efe9] flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenSettings={() => setIsBackupModalOpen(true)}
      />

      {/* Main Tab Content - Keep mounted in DOM so timers, state, and notes never reset or unmount */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className={currentTab === 'practice' ? 'block' : 'hidden'}>
          <PracticeTab />
        </div>
        <div className={currentTab === 'routines' ? 'block' : 'hidden'}>
          <RoutinesTab onSwitchToPractice={() => setCurrentTab('practice')} />
        </div>
        <div className={currentTab === 'items' ? 'block' : 'hidden'}>
          <ItemsTab />
        </div>
        <div className={currentTab === 'stats' ? 'block' : 'hidden'}>
          <StatsTab />
        </div>
        <div className={currentTab === 'about' ? 'block' : 'hidden'}>
          <AboutTab />
        </div>
      </main>

      {/* Bottom Footer - Analog Studio Signature */}
      <footer className="border-t border-[#29241e] bg-[#100e0c] py-4 text-xs text-[#8c8273]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
            <span className="font-semibold text-[#b8ad9e]">JustinGuitar Methodology</span>
            <span className="text-[#595248]">|</span>
            <span>Deliberate Practice Workbench</span>
          </div>
          <span className="font-mono text-[11px] text-[#70675a]">ANALOG AUDIO & PRACTICE TOOLS • NO CLOUD LOCK-IN</span>
        </div>
      </footer>

      {/* Settings & Backup Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <PracticeProvider>
      <AppContent />
    </PracticeProvider>
  );
}
