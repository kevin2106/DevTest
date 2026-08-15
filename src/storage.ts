import { useCallback, useEffect, useState } from 'react';
import type { AppData, Goal, Habit, JournalEntry } from './types';

const STORAGE_KEY = 'personal-dev-data-v1';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // fall through to defaults
  }
  return { goals: [], habits: [], journal: [] };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    setData((d) => ({
      ...d,
      goals: [...d.goals, { ...goal, id: uid(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setData((d) => ({
      ...d,
      goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    setData((d) => ({
      ...d,
      habits: [
        ...d.habits,
        { ...habit, id: uid(), createdAt: new Date().toISOString(), completedDates: [] },
      ],
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }));
  }, []);

  const toggleHabitDate = useCallback((id: string, date: string) => {
    setData((d) => ({
      ...d,
      habits: d.habits.map((h) => {
        if (h.id !== id) return h;
        const has = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: has
            ? h.completedDates.filter((x) => x !== date)
            : [...h.completedDates, date].sort(),
        };
      }),
    }));
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    setData((d) => ({
      ...d,
      journal: [
        { ...entry, id: uid(), createdAt: new Date().toISOString() },
        ...d.journal,
      ],
    }));
  }, []);

  const updateJournalEntry = useCallback((id: string, patch: Partial<JournalEntry>) => {
    setData((d) => ({
      ...d,
      journal: d.journal.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }));
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setData((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) }));
  }, []);

  return {
    data,
    addGoal,
    updateGoal,
    deleteGoal,
    addHabit,
    deleteHabit,
    toggleHabitDate,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
  };
}
