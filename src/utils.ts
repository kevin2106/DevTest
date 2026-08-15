import type { Habit } from './types';

export function calcStreak(habit: Habit): number {
  const set = new Set(habit.completedDates);
  let streak = 0;
  const cursor = new Date();
  // if today isn't done yet, start counting from yesterday
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function last7Days(): string[] {
  const days: string[] = [];
  const cursor = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function last14Days(): string[] {
  const days: string[] = [];
  const cursor = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const HABIT_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#3b82f6',
];

export const GOAL_CATEGORIES = [
  'Career', 'Health', 'Learning', 'Finance', 'Relationships', 'Mindfulness', 'Other',
];

export const MOOD_EMOJI: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};
