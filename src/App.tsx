import { useEffect, useState } from 'react';
import { LayoutDashboard, Target, Repeat, BookOpen, Moon, Sun, Sparkles } from 'lucide-react';
import { useAppData } from './storage';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Habits from './components/Habits';
import Journal from './components/Journal';

type View = 'dashboard' | 'goals' | 'habits' | 'journal';

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'habits', label: 'Habits', icon: Repeat },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const app = useAppData();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 fixed inset-y-0 left-0 hidden md:flex">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <Sparkles className="text-violet-500" size={24} />
          <span className="font-semibold text-lg tracking-tight">GrowthPath</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                view === id
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => setDark((v) => !v)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 w-full"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-500" size={20} />
            <span className="font-semibold">GrowthPath</span>
          </div>
          <button onClick={() => setDark((v) => !v)} className="p-2">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                view === id
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 md:ml-64 mt-24 md:mt-0 p-4 md:p-8 max-w-6xl w-full mx-auto">
        {view === 'dashboard' && <Dashboard app={app} onNavigate={setView} />}
        {view === 'goals' && <Goals app={app} />}
        {view === 'habits' && <Habits app={app} />}
        {view === 'journal' && <Journal app={app} />}
      </main>
    </div>
  );
}
