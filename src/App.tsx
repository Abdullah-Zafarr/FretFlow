import React, { useState } from 'react';
import { PracticeProvider } from './context/PracticeContext';
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenSettings={() => setIsBackupModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {currentTab === 'practice' && <PracticeTab />}
        {currentTab === 'routines' && (
          <RoutinesTab onSwitchToPractice={() => setCurrentTab('practice')} />
        )}
        {currentTab === 'items' && <ItemsTab />}
        {currentTab === 'stats' && <StatsTab />}
        {currentTab === 'about' && <AboutTab />}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>🎸 JustinGuitar "My Practice Assistant" (Web Edition)</span>
          <span>Deliberate Practice • Built for Guitarists</span>
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
