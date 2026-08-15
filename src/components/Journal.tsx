import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { todayISO, type useAppData } from '../storage';
import type { Mood } from '../types';
import { MOOD_EMOJI, formatDate } from '../utils';

const MOODS: Mood[] = [1, 2, 3, 4, 5];

export default function Journal({ app }: { app: ReturnType<typeof useAppData> }) {
  const { data, addJournalEntry, deleteJournalEntry } = app;
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [mood, setMood] = useState<Mood>(3);

  const submit = () => {
    if (!content.trim() && !gratitude.trim()) return;
    addJournalEntry({
      date: todayISO(),
      content: content.trim(),
      gratitude: gratitude.trim(),
      mood,
    });
    setContent('');
    setGratitude('');
    setMood(3);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Reflect on your day and track how you're feeling.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">How are you feeling?</label>
          <div className="flex gap-2 mt-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  mood === m ? 'bg-violet-100 dark:bg-violet-500/20 ring-2 ring-violet-500' : 'bg-slate-50 dark:bg-slate-800'
                }`}
              >
                {MOOD_EMOJI[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">What's on your mind?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Write about your day, wins, challenges, anything..."
            className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">One thing you're grateful for</label>
          <input
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="A good coffee, a kind word, a small win..."
            className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
          />
        </div>

        <button
          onClick={submit}
          disabled={!content.trim() && !gratitude.trim()}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save entry
        </button>
      </div>

      <div className="space-y-3">
        {data.journal.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
            No entries yet. Your reflections will appear here.
          </div>
        ) : (
          data.journal.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{MOOD_EMOJI[entry.mood]}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</span>
                </div>
                <button
                  onClick={() => deleteJournalEntry(entry.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {entry.content && <p className="text-sm mt-3 whitespace-pre-wrap">{entry.content}</p>}
              {entry.gratitude && (
                <p className="text-sm mt-3 text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Grateful for:</span> {entry.gratitude}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
