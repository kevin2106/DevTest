export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  category: string;
  description: string;
  targetDate: string | null;
  progress: number; // 0-100
  status: GoalStatus;
  createdAt: string;
}

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  color: string;
  completedDates: string[]; // ISO date strings (yyyy-mm-dd)
  createdAt: string;
}

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  date: string; // yyyy-mm-dd
  content: string;
  mood: Mood;
  gratitude: string;
  createdAt: string;
}

export interface AppData {
  goals: Goal[];
  habits: Habit[];
  journal: JournalEntry[];
}
