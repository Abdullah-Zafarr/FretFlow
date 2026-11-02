import { createContext } from 'react';
import type { PracticeItem, Routine, PracticeLog, UserSettings } from '../types/practice';

export interface PracticeContextType {
  items: PracticeItem[];
  routines: Routine[];
  activeRoutine: Routine | undefined;
  activeItemId: string | null;
  activeItem: PracticeItem | null;
  activeItemEntryMinutes: number;
  logs: PracticeLog[];
  settings: UserSettings;

  // Timer
  timerSeconds: number;
  timerTotalSeconds: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerSeconds: (secs: number) => void;

  // Practice actions
  selectActiveItem: (itemId: string) => void;
  markItemDone: (itemId: string, logFullTime?: boolean, actualMinutes?: number, scoreCount?: number) => void;
  repeatActiveItem: () => void;
  prevItem: () => void;
  nextItem: () => void;
  resetRoutineDoneStatus: (routineId?: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  updateItemThingsToRemember: (itemId: string, thingsToRemember: string) => void;
  updateItemBpm: (itemId: string, bpm: number) => void;

  // Routine Management
  activateRoutine: (routineId: string) => void;
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  createRoutine: (name: string, description?: string) => Routine;

  // Item Management
  saveItem: (item: PracticeItem) => void;
  duplicateItem: (itemId: string) => void;
  archiveItem: (itemId: string) => void;
  restoreItem: (itemId: string) => void;
  deleteItemPermanently: (itemId: string) => void;

  // Logs & Stats
  addPracticeLog: (entry: { itemId: string; itemName: string; minutes: number; routineId?: string; routineName?: string; notes?: string; bpm?: number; scoreCount?: number; date?: string }) => void;
  deletePracticeLog: (logId: string) => void;

  // Settings & Storage
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  resetToDefaultData: () => void;
}

export const PracticeContext = createContext<PracticeContextType | null>(null);
