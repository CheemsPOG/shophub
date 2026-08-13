import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: string; up: boolean };
  accent?: 'brand' | 'blue' | 'success' | 'warning' | 'ink';
}

export function StatCard({ label, value, icon, trend, accent = 'brand' }: StatCardProps) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    ink: 'bg-ink-100 text-ink-600',
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[accent]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trend.up ? 'text-success-600' : 'text-error-600'}`}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}
