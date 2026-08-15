import { Target, Flame, CheckCircle2, Smile } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import type { useAppData } from '../storage';
import { calcStreak, formatDayLabel, last14Days, last7Days, MOOD_EMOJI } from '../utils';
import StatCard from './StatCard';

type View = 'dashboard' | 'goals' | 'habits' | 'journal';

export default function Dashboard({
  app,
  onNavigate,
}: {
  app: ReturnType<typeof useAppData>;
  onNavigate: (v: View) => void;
}) {
  const { data } = app;
  const activeGoals = data.goals.filter((g) => g.status === 'active');
  const avgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
    : 0;

  const bestStreak = data.habits.reduce((max, h) => Math.max(max, calcStreak(h)), 0);
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = data.habits.filter((h) => h.completedDates.includes(today)).length;

  const days7 = last7Days();
  const habitChartData = days7.map((d) => ({
    day: formatDayLabel(d),
    completed: data.habits.filter((h) => h.completedDates.includes(d)).length,
  }));

  const days14 = last14Days();
  const moodByDay = new Map(data.journal.map((j) => [j.date, j.mood]));
  const moodChartData = days14
    .filter((d) => moodByDay.has(d))
    .map((d) => ({ day: formatDayLabel(d), mood: moodByDay.get(d) }));

  const recentEntry = data.journal[0];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Here's a snapshot of your personal development journey.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Active goals" value={activeGoals.length} sub={`${avgProgress}% avg progress`} color="#8b5cf6" />
        <StatCard icon={Flame} label="Best streak" value={`${bestStreak}d`} color="#f59e0b" />
        <StatCard icon={CheckCircle2} label="Habits done today" value={`${doneToday}/${data.habits.length}`} color="#10b981" />
        <StatCard icon={Smile} label="Journal entries" value={data.journal.length} color="#ec4899" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-medium mb-4">Habit completions — last 7 days</h2>
          {data.habits.length === 0 ? (
            <EmptyHint text="Add a habit to see your progress here." onClick={() => onNavigate('habits')} cta="Add a habit" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={habitChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-medium mb-4">Mood trend — last 14 days</h2>
          {moodChartData.length === 0 ? (
            <EmptyHint text="Log a journal entry to track your mood." onClick={() => onNavigate('journal')} cta="Write an entry" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis domain={[1, 5]} allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${MOOD_EMOJI[Number(v)] ?? ''} ${v}`, 'Mood']}
                />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-medium mb-4">Goals in progress</h2>
          {activeGoals.length === 0 ? (
            <EmptyHint text="Set a goal to start tracking progress." onClick={() => onNavigate('goals')} cta="Add a goal" />
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 5).map((g) => (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-slate-500 dark:text-slate-400">{g.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-medium mb-4">Latest reflection</h2>
          {recentEntry ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{MOOD_EMOJI[recentEntry.mood]}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{recentEntry.date}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4 whitespace-pre-wrap">
                {recentEntry.content || 'No notes for this entry.'}
              </p>
            </div>
          ) : (
            <EmptyHint text="Your reflections will show up here." onClick={() => onNavigate('journal')} cta="Write an entry" />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyHint({ text, cta, onClick }: { text: string; cta: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
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
