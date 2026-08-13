interface BarChartProps {
  data: { label: string; value: number }[];
  format?: (v: number) => string;
  color?: string;
  height?: number;
}

export function BarChart({ data, format, color = 'bg-brand-500', height = 200 }: BarChartProps) {
  const max = Math.max(0, ...data.map(d => d.value));
  const fmt = format || ((v: number) => v.toLocaleString());

  if (data.length === 0) {
    return <div className="flex items-center justify-center text-sm text-ink-400" style={{ height }}>No data yet</div>;
  }

  return (
    <div className="flex items-end justify-between gap-3" style={{ height }}>
      {data.map((d, i) => {
        const pct = max === 0 ? 0 : (d.value / max) * 100;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              <div
                className={`w-full max-w-[40px] rounded-t-lg ${color} opacity-80 transition-all duration-300 group-hover:opacity-100`}
                style={{ height: `${pct}%` }}
              />
              <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {fmt(d.value)}
              </div>
            </div>
            <span className="text-xs font-medium text-ink-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
