export type ItemCategory = 
  | 'Technique' 
  | 'Chords' 
  | 'Rhythm' 
  | 'Songs' 
  | 'Theory' 
  | 'Warmup';

export interface PracticeItem {
  id: string;
  name: string;
  defaultMinutes: number;
  notes: string;
  thingsToRemember: string;
  videoUrl?: string;
  category?: ItemCategory;
  targetBpm?: number;
  timeSignature?: '4/4' | '3/4' | '2/4' | '6/8';
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineEntry {
  itemId: string;
  minutes: number;
  doneThisSession?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  entries: RoutineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PracticeLog {
  id: string;
  routineId?: string;
  routineName?: string;
  itemId: string;
  itemName: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  minutes: number;
  notes?: string;
  bpm?: number;
  scoreCount?: number; // e.g. One-Minute Changes reps
}

export interface UserSettings {
  alwaysPlayVideo: boolean;
  soundEnabled: boolean;
  alarmTone: 'chime' | 'bell' | 'beep';
  autoAdvance: boolean;
  dailyGoalMinutes: number;
  theme: 'dark' | 'light';
}

export interface ChordDefinition {
  name: string;
  frets: (number | 'x')[]; // 6 strings from low E to high e: [E, A, D, G, B, e]
  fingers?: (number | 0)[];
  barre?: { fret: number; fromString: number; toString: number };
  baseFret?: number;
}
