import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PracticeItem, Routine, PracticeLog, UserSettings } from '../types/practice';
import { INITIAL_ITEMS, INITIAL_ROUTINES, INITIAL_LOGS, INITIAL_SETTINGS } from '../data/initialData';
import { soundEngine } from '../utils/audio';
import { PracticeContext } from './PracticeContextDef';

const STORAGE_KEY_ITEMS = 'guitar_pa_items_v1';
const STORAGE_KEY_ROUTINES = 'guitar_pa_routines_v1';
const STORAGE_KEY_LOGS = 'guitar_pa_logs_v1';
const STORAGE_KEY_SETTINGS = 'guitar_pa_settings_v1';

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or persisted items
  const [items, setItems] = useState<PracticeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  // Load routines
  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUTINES);
      return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  // Load logs
  const [logs, setLogs] = useState<PracticeLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Load settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Active routine
  const activeRoutine = useMemo(() => {
    return routines.find((r) => r.active) || routines[0];
  }, [routines]);

  // Selected item ID in active routine
  const [activeItemId, setActiveItemId] = useState<string | null>(() => {
    if (activeRoutine && activeRoutine.entries.length > 0) {
      // Find first not done, or first entry
      const firstUndone = activeRoutine.entries.find((e) => !e.doneThisSession);
      return firstUndone ? firstUndone.itemId : activeRoutine.entries[0].itemId;
    }
    return null;
  });

  // Selected item object
  const activeItem = useMemo(() => {
    if (!activeItemId) return null;
    return items.find((i) => i.id === activeItemId) || null;
  }, [items, activeItemId]);

  // Active entry duration inside current routine
  const activeItemEntryMinutes = useMemo(() => {
    if (!activeRoutine || !activeItemId) return activeItem?.defaultMinutes || 5;
    const entry = activeRoutine.entries.find((e) => e.itemId === activeItemId);
    return entry ? entry.minutes : (activeItem?.defaultMinutes || 5);
  }, [activeRoutine, activeItemId, activeItem]);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(activeItemEntryMinutes * 60);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState<number>(activeItemEntryMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Sync timer when active item changes or entry minutes change
  useEffect(() => {
    const totalSecs = activeItemEntryMinutes * 60;
    setTimerTotalSeconds(totalSecs);
    setTimerSeconds(totalSecs);
    setIsTimerRunning(false);
  }, [activeItemId, activeItemEntryMinutes]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsTimerRunning(false);
          // Sound alarm
          if (settings.soundEnabled) {
            soundEngine.playAlarm(settings.alarmTone);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimerRunning, settings.soundEnabled, settings.alarmTone]);

  const startTimer = useCallback(() => {
    soundEngine.unlockAudio();
    setIsTimerRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSeconds(activeItemEntryMinutes * 60);
  }, [activeItemEntryMinutes]);

  const selectActiveItem = useCallback((itemId: string) => {
    setActiveItemId(itemId);
  }, []);

  const addPracticeLog = useCallback((entry: { itemId: string; itemName: string; minutes: number; routineId?: string; routineName?: string; notes?: string; bpm?: number; scoreCount?: number; date?: string }) => {
    const today = entry.date || new Date().toISOString().split('T')[0];
    const newLog: PracticeLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      routineId: entry.routineId,
      routineName: entry.routineName,
      itemId: entry.itemId,
      itemName: entry.itemName,
      date: today,
      timestamp: new Date().toISOString(),
      minutes: Math.max(1, Math.round(entry.minutes)),
      notes: entry.notes,
      bpm: entry.bpm,
      scoreCount: entry.scoreCount,
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  const deletePracticeLog = useCallback((logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  }, []);

  // Mark an item done
  const markItemDone = useCallback((itemId: string, logFullTime: boolean = true, actualMinutes?: number, scoreCount?: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const entryMinutes = activeRoutine?.entries.find((e) => e.itemId === itemId)?.minutes || item.defaultMinutes;
    const minutesToLog = actualMinutes !== undefined ? actualMinutes : (logFullTime ? entryMinutes : Math.max(1, Math.round((timerTotalSeconds - timerSeconds) / 60)));

    // Log the practice
    addPracticeLog({
      itemId,
      itemName: item.name,
      minutes: minutesToLog,
      routineId: activeRoutine?.id,
      routineName: activeRoutine?.name,
      bpm: item.targetBpm,
      scoreCount,
    });

    // Mark as done in routine
    if (activeRoutine) {
      setRoutines((prev) =>
        prev.map((r) => {
          if (r.id !== activeRoutine.id) return r;
          return {
            ...r,
            entries: r.entries.map((e) => (e.itemId === itemId ? { ...e, doneThisSession: true } : e)),
          };
        })
      );
    }

    // Auto advance if configured
    if (settings.autoAdvance && activeRoutine) {
      const currentIndex = activeRoutine.entries.findIndex((e) => e.itemId === itemId);
      const nextEntry = activeRoutine.entries.slice(currentIndex + 1).find((e) => !e.doneThisSession);
      if (nextEntry) {
        setActiveItemId(nextEntry.itemId);
      }
    }
  }, [items, activeRoutine, timerTotalSeconds, timerSeconds, addPracticeLog, settings.autoAdvance]);

  const repeatActiveItem = useCallback(() => {
    resetTimer();
    startTimer();
  }, [resetTimer, startTimer]);

  const nextItem = useCallback(() => {
    if (!activeRoutine || !activeItemId) return;
    const currentIndex = activeRoutine.entries.findIndex((e) => e.itemId === activeItemId);
    if (currentIndex >= 0 && currentIndex < activeRoutine.entries.length - 1) {
      setActiveItemId(activeRoutine.entries[currentIndex + 1].itemId);
    }
  }, [activeRoutine, activeItemId]);

  const resetRoutineDoneStatus = useCallback((routineId?: string) => {
    const targetId = routineId || activeRoutine?.id;
    if (!targetId) return;

    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== targetId) return r;
        return {
          ...r,
          entries: r.entries.map((e) => ({ ...e, doneThisSession: false })),
        };
      })
    );
  }, [activeRoutine]);

  const updateItemNotes = useCallback((itemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, notes, updatedAt: new Date().toISOString() } : item
      )
    );
  }, []);

  const updateItemThingsToRemember = useCallback((itemId: string, thingsToRemember: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, thingsToRemember, updatedAt: new Date().toISOString() } : item
      )
    );
  }, []);

  const updateItemBpm = useCallback((itemId: string, bpm: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, targetBpm: bpm, updatedAt: new Date().toISOString() } : item
      )
    );
  }, []);

  const activateRoutine = useCallback((routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) => ({
        ...r,
        active: r.id === routineId,
      }))
    );
    const target = routines.find((r) => r.id === routineId);
    if (target && target.entries.length > 0) {
      setActiveItemId(target.entries[0].itemId);
    }
  }, [routines]);

  const saveRoutine = useCallback((routine: Routine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === routine.id);
      if (exists) {
        return prev.map((r) => (r.id === routine.id ? { ...routine, updatedAt: new Date().toISOString() } : r));
      }
      return [...prev, { ...routine, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  }, []);

  const deleteRoutine = useCallback((routineId: string) => {
    setRoutines((prev) => {
      const filtered = prev.filter((r) => r.id !== routineId);
      if (filtered.length > 0 && !filtered.some((r) => r.active)) {
        filtered[0].active = true;
      }
      return filtered;
    });
  }, []);

  const createRoutine = useCallback((name: string, description?: string): Routine => {
    const newRoutine: Routine = {
      id: 'routine-' + Date.now(),
      name,
      description: description || '',
      active: false,
      entries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoutines((prev) => [...prev, newRoutine]);
    return newRoutine;
  }, []);

  const saveItem = useCallback((item: PracticeItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : i));
      }
      return [...prev, { ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  }, []);

  const duplicateItem = useCallback((itemId: string) => {
    const original = items.find((i) => i.id === itemId);
    if (!original) return;
    const duplicated: PracticeItem = {
      ...original,
      id: 'item-' + Date.now(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, duplicated]);
  }, [items]);

  const archiveItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, archived: true, updatedAt: new Date().toISOString() } : i))
    );
  }, []);

  const restoreItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, archived: false, updatedAt: new Date().toISOString() } : i))
    );
  }, []);

  const deleteItemPermanently = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    // Remove from routines
    setRoutines((prev) =>
      prev.map((r) => ({
        ...r,
        entries: r.entries.filter((e) => e.itemId !== itemId),
      }))
    );
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const exportDataJson = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items,
      routines,
      logs,
      settings,
    };
    return JSON.stringify(data, null, 2);
  }, [items, routines, logs, settings]);

  const importDataJson = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.items && Array.isArray(data.items)) setItems(data.items);
      if (data.routines && Array.isArray(data.routines)) setRoutines(data.routines);
      if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }, []);

  const resetToDefaultData = useCallback(() => {
    setItems(INITIAL_ITEMS);
    setRoutines(INITIAL_ROUTINES);
    setLogs(INITIAL_LOGS);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
  }, []);

  const value = {
    items,
    routines,
    activeRoutine,
    activeItemId,
    activeItem,
    activeItemEntryMinutes,
    logs,
    settings,
    timerSeconds,
    timerTotalSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerSeconds,
    selectActiveItem,
    markItemDone,
    repeatActiveItem,
    nextItem,
    resetRoutineDoneStatus,
    updateItemNotes,
    updateItemThingsToRemember,
    updateItemBpm,
    activateRoutine,
    saveRoutine,
    deleteRoutine,
    createRoutine,
    saveItem,
    duplicateItem,
    archiveItem,
    restoreItem,
    deleteItemPermanently,
    addPracticeLog,
    deletePracticeLog,
    updateSettings,
    exportDataJson,
    importDataJson,
    resetToDefaultData,
  };

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
};
