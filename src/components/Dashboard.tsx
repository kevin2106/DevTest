import { Target, Flame, CheckCircle2, Check, Minus, PlusIcon } from 'lucide-react';
import { todayISO, type useAppData } from '../storage';
import { calcStreak, MOOD_EMOJI } from '../utils';

type View = 'dashboard' | 'goals' | 'habits' | 'journal';
const MOODS = [1, 2, 3, 4, 5] as const;

export default function Dashboard({
  app,
  onNavigate,
}: {
  app: ReturnType<typeof useAppData>;
  onNavigate: (v: View) => void;
}) {
  const { data, toggleHabitDate, updateGoal, addJournalEntry, updateJournalEntry } = app;
  const today = todayISO();

  const activeGoals = data.goals.filter((g) => g.status === 'active').sort((a, b) => a.progress - b.progress);
  const doneToday = data.habits.filter((h) => h.completedDates.includes(today)).length;
  const bestStreak = data.habits.reduce((max, h) => Math.max(max, calcStreak(h)), 0);
  const todaysEntry = data.journal.find((j) => j.date === today);

  const bumpGoal = (id: string, current: number, delta: number) => {
    const progress = Math.min(100, Math.max(0, current + delta));
    updateGoal(id, { progress, status: progress === 100 ? 'completed' : 'active' });
  };

  const setMood = (mood: number) => {
    if (todaysEntry) {
      updateJournalEntry(todaysEntry.id, { mood: mood as 1 | 2 | 3 | 4 | 5 });
    } else {
      addJournalEntry({ date: today, content: '', gratitude: '', mood: mood as 1 | 2 | 3 | 4 | 5 });
    }
  };

  const greeting = getGreeting();

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {data.habits.length === 0 && data.goals.length === 0
            ? "Let's set something up to work towards."
            : `${doneToday}/${data.habits.length} habits done today · ${activeGoals.length} active goal${activeGoals.length === 1 ? '' : 's'}${bestStreak > 0 ? ` · ${bestStreak}d best streak` : ''}`}
        </p>
      </div>

      {/* Today's habits — checklist */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" /> Today's habits
          </h2>
          {data.habits.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{doneToday}/{data.habits.length} done</span>
          )}
        </div>
        {data.habits.length === 0 ? (
          <EmptyHint text="No habits yet — add one to start building streaks." cta="Add a habit" onClick={() => onNavigate('habits')} />
        ) : (
          <ul className="space-y-2">
            {data.habits.map((h) => {
              const done = h.completedDates.includes(today);
              const streak = calcStreak(h);
              return (
                <li
                  key={h.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    done
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => toggleHabitDate(h.id, today)}
                    aria-label={done ? 'Mark not done' : 'Mark done'}
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                      done ? 'text-white' : 'bg-slate-100 dark:bg-slate-800 text-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    style={done ? { backgroundColor: h.color } : undefined}
                  >
                    <Check size={15} />
                  </button>
                  <span className={`flex-1 text-sm font-medium min-w-0 truncate ${done ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                    {h.name}
                  </span>
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-500 shrink-0">
                      <Flame size={13} /> {streak}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Active goals — quick progress */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium flex items-center gap-2">
            <Target size={18} className="text-violet-500" /> Active goals
          </h2>
        </div>
        {activeGoals.length === 0 ? (
          <EmptyHint text="Set a goal to start tracking progress." cta="Add a goal" onClick={() => onNavigate('goals')} />
        ) : (
          <ul className="space-y-4">
            {activeGoals.map((g) => (
              <li key={g.id}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium truncate">{g.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{g.progress}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => bumpGoal(g.id, g.progress, -10)}
                      disabled={g.progress <= 0}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Decrease progress"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => bumpGoal(g.id, g.progress, 10)}
                      disabled={g.progress >= 100}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 disabled:opacity-30 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-colors"
                      aria-label="Increase progress"
                    >
                      <PlusIcon size={12} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick mood check-in */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h2 className="font-medium mb-4">How are you feeling today?</h2>
        <div className="flex gap-2 mb-4">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                todaysEntry?.mood === m ? 'bg-violet-100 dark:bg-violet-500/20 ring-2 ring-violet-500' : 'bg-slate-50 dark:bg-slate-800'
              }`}
            >
              {MOOD_EMOJI[m]}
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('journal')}
          className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          {todaysEntry ? "Edit today's reflection →" : 'Write a reflection →'}
        </button>
      </section>

      {/* Recently completed goals */}
      {data.goals.some((g) => g.status === 'completed') && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-medium mb-3">Completed goals</h2>
          <ul className="space-y-2">
            {data.goals
              .filter((g) => g.status === 'completed')
              .slice(0, 5)
              .map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </span>
                  <span className="truncate">{g.title}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function EmptyHint({ text, cta, onClick }: { text: string; cta: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 gap-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
      <button
        onClick={onClick}
        className="text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
      >
        {cta}
      </button>
    </div>
  );
}
