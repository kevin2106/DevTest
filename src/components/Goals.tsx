import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { useAppData } from '../storage';
import type { Goal, GoalStatus } from '../types';
import { GOAL_CATEGORIES, formatDate } from '../utils';

export default function Goals({ app }: { app: ReturnType<typeof useAppData> }) {
  const { data, addGoal, updateGoal, deleteGoal } = app;
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all');

  const goals = data.goals.filter((g) => filter === 'all' || g.status === filter);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Define what you're working towards and track progress.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Plus size={16} /> New goal
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'completed', 'paused'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
              filter === f
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
          No goals here yet. Create one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />
          ))}
        </div>
      )}

      {showForm && <GoalForm onClose={() => setShowForm(false)} onSave={addGoal} />}
    </div>
  );
}

function GoalCard({
  goal,
  onUpdate,
  onDelete,
}: {
  goal: Goal;
  onUpdate: (id: string, patch: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            {goal.category}
          </span>
          <h3 className="font-medium mt-2">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{goal.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={goal.progress}
          onChange={(e) => {
            const progress = Number(e.target.value);
            onUpdate(goal.id, {
              progress,
              status: progress === 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status,
            });
          }}
          className="w-full accent-violet-600"
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{goal.targetDate ? `Due ${formatDate(goal.targetDate)}` : 'No deadline'}</span>
        <select
          value={goal.status}
          onChange={(e) => onUpdate(goal.id, { status: e.target.value as GoalStatus })}
          className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs capitalize"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>
    </div>
  );
}

function GoalForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category,
      description: description.trim(),
      targetDate: targetDate || null,
      progress: 0,
      status: 'active',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">New goal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Run a half marathon"
              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Why does this matter to you?"
              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Target date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!title.trim()}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Create goal
        </button>
      </div>
    </div>
  );
}
