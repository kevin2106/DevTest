import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Check, Sparkles } from 'lucide-react';
import { todayISO, type useAppData } from '../storage';
import { GOAL_CATEGORIES, HABIT_COLORS, MOOD_EMOJI } from '../utils';
import { parseTranscript, type ParsedResult, type ParsedType } from '../voiceParse';
import type { Mood } from '../types';

const inputClass =
  'w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500';

export default function VoiceAssistant({ app }: { app: ReturnType<typeof useAppData> }) {
  const [supported] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(null);

  useEffect(() => {
    if (!supported) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onerror = (event) => {
      setError(event.error === 'not-allowed' ? 'Microphone access denied.' : "Didn't catch that — try again.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, [supported]);

  useEffect(() => {
    if (!listening && transcript.trim() && !parsed) {
      setParsed(parseTranscript(transcript.trim()));
    }
  }, [listening, transcript, parsed]);

  if (!supported) return null;

  const startListening = () => {
    setError('');
    setTranscript('');
    setParsed(null);
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch {
      // recognition already running; ignore
    }
  };

  const stopListening = () => recognitionRef.current?.stop();

  const reset = () => {
    setTranscript('');
    setParsed(null);
    setError('');
  };

  const confirm = () => {
    if (!parsed) return;
    if (parsed.type === 'goal') {
      app.addGoal({
        title: parsed.goal.title,
        category: parsed.goal.category,
        description: parsed.goal.description,
        targetDate: null,
        progress: 0,
        status: 'active',
      });
    } else if (parsed.type === 'habit') {
      app.addHabit({
        name: parsed.habit.name,
        frequency: parsed.habit.frequency,
        color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
      });
    } else {
      const today = todayISO();
      const existing = app.data.journal.find((j) => j.date === today);
      if (existing) {
        app.updateJournalEntry(existing.id, { content: parsed.journal.content, mood: parsed.journal.mood });
      } else {
        app.addJournalEntry({
          date: today,
          content: parsed.journal.content,
          mood: parsed.journal.mood,
          gratitude: parsed.journal.gratitude,
        });
      }
    }
    reset();
  };

  return (
    <>
      <button
        onClick={listening ? stopListening : startListening}
        aria-label={listening ? 'Stop listening' : 'Add by voice'}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-colors ${
          listening ? 'bg-red-500 animate-pulse' : 'bg-violet-600 hover:bg-violet-700'
        }`}
      >
        {listening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      {(listening || transcript || error) && !parsed && (
        <div className="fixed bottom-24 right-6 z-40 w-72 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <p className="text-xs font-medium text-violet-500 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={12} /> {listening ? 'Listening…' : 'Heard you'}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 min-h-[1.25rem]">
                {transcript || 'Try "Add a habit to drink water" or "New goal to run a 5k"'}
              </p>
            </>
          )}
        </div>
      )}

      {parsed && <ConfirmCard parsed={parsed} onCancel={reset} onConfirm={confirm} onChange={setParsed} />}
    </>
  );
}

function ConfirmCard({
  parsed,
  onCancel,
  onConfirm,
  onChange,
}: {
  parsed: ParsedResult;
  onCancel: () => void;
  onConfirm: () => void;
  onChange: (p: ParsedResult) => void;
}) {
  const typeLabel: Record<ParsedType, string> = { goal: 'Goal', habit: 'Habit', journal: 'Journal entry' };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" /> Confirm before adding
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 italic">"{parsed.raw}"</p>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Add as</label>
          <div className="flex gap-2 mt-1.5">
            {(['goal', 'habit', 'journal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...parsed, type: t })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  parsed.type === t
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {typeLabel[t]}
              </button>
            ))}
          </div>
        </div>

        {parsed.type === 'goal' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Title</label>
              <input
                autoFocus
                value={parsed.goal.title}
                onChange={(e) => onChange({ ...parsed, goal: { ...parsed.goal, title: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
              <select
                value={parsed.goal.category}
                onChange={(e) => onChange({ ...parsed, goal: { ...parsed.goal, category: e.target.value } })}
                className={inputClass}
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {parsed.type === 'habit' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Habit name</label>
              <input
                autoFocus
                value={parsed.habit.name}
                onChange={(e) => onChange({ ...parsed, habit: { ...parsed.habit, name: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Frequency</label>
              <select
                value={parsed.habit.frequency}
                onChange={(e) =>
                  onChange({ ...parsed, habit: { ...parsed.habit, frequency: e.target.value as 'daily' | 'weekly' } })
                }
                className={inputClass}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        )}

        {parsed.type === 'journal' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Entry</label>
              <textarea
                rows={3}
                value={parsed.journal.content}
                onChange={(e) => onChange({ ...parsed, journal: { ...parsed.journal, content: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Mood</label>
              <div className="flex gap-2 mt-1.5">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => onChange({ ...parsed, journal: { ...parsed.journal, mood: m as Mood } })}
                    className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center ${
                      parsed.journal.mood === m
                        ? 'bg-violet-100 dark:bg-violet-500/20 ring-2 ring-violet-500'
                        : 'bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {MOOD_EMOJI[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Check size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
