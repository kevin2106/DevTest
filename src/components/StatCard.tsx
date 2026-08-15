import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-start gap-4">
      <div className="rounded-xl p-2.5" style={{ backgroundColor: `${color}1a`, color }}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
