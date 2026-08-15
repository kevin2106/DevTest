import { useState } from 'react';
import { Plus, Trash2, X, Flame, Check } from 'lucide-react';
import { todayISO, type useAppData } from '../storage';
import type { Habit } from '../types';
import { HABIT_COLORS, calcStreak, formatDayLabel, last7Days } from '../utils';

export default function Habits({ app }: { app: ReturnType<typeof useAppData> }) {
  const { data, addHabit, deleteHabit, toggleHabitDate } = app;
  const [showForm, setShowForm] = useState(false);
  const days = last7Days();
  const today = todayISO();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Build consistency, one day at a time.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Plus size={16} /> New habit
        </button>
      </div>

      {data.habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
          No habits tracked yet. Add one to start building streaks.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: '1fr repeat(7, 40px) 56px 40px' }}>
            <div className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Habit</div>
            {days.map((d) => (
              <div key={d} className="px-1 py-3 text-xs font-medium text-slate-400 text-center">
                {formatDayLabel(d)}
              </div>
            ))}
            <div className="px-1 py-3 text-xs font-medium text-slate-400 text-center">Streak</div>
            <div />

            {data.habits.map((h) => (
              <HabitRow key={h.id} habit={h} days={days} today={today} onToggle={toggleHabitDate} onDelete={deleteHabit} />
            ))}
          </div>
        </div>
      )}

      {showForm && <HabitForm onClose={() => setShowForm(false)} onSave={addHabit} />}
    </div>
  );
}

function HabitRow({
  habit,
  days,
  today,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  days: string[];
  today: string;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}) {
  const streak = calcStreak(habit);
  return (
    <div
      className="grid items-center border-t border-slate-100 dark:border-slate-800"
      style={{ gridTemplateColumns: '1fr repeat(7, 40px) 56px 40px' }}
    >
      <div className="px-4 py-3 flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
        <span className="text-sm font-medium truncate">{habit.name}</span>
      </div>
      {days.map((d) => {
        const done = habit.completedDates.includes(d);
        const isFuture = d > today;
        return (
          <div key={d} className="flex justify-center py-2">
            <button
              disabled={isFuture}
              onClick={() => onToggle(habit.id, d)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                done ? 'text-white' : 'bg-slate-100 dark:bg-slate-800 text-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={done ? { backgroundColor: habit.color } : undefined}
            >
              <Check size={14} />
            </button>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-amber-500">
        {streak > 0 && <Flame size={14} />}
        {streak}
      </div>
      <button
        onClick={() => onDelete(habit.id)}
        className="text-slate-300 hover:text-red-500 transition-colors flex justify-center"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function HabitForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
}) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState(HABIT_COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), frequency, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">New habit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meditate 10 minutes"
              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Color</label>
            <div className="flex gap-2 mt-1.5">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Create habit
        </button>
      </div>
    </div>
  );
}
