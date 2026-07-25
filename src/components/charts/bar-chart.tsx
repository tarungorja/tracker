import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number; // rendered height basis
  display?: string; // label shown above the bar (defaults to value)
  title?: string; // hover tooltip
}

/**
 * Responsive vertical bar chart (single-hue = magnitude), built from CSS so it
 * scales cleanly. Rounded data-ends, 2px gaps, recessive baseline, direct
 * labels, native hover tooltips.
 */
export function BarChart({
  data,
  max,
  unit = "",
  height = 180,
  barClassName = "bg-gradient-to-t from-indigo-500 to-violet-500",
  showValues = true,
}: {
  data: BarDatum[];
  max?: number;
  unit?: string;
  height?: number;
  barClassName?: string;
  showValues?: boolean;
}) {
  const maxValue = Math.max(max ?? 0, ...data.map((d) => d.value), 1);

  return (
    <div>
      <div
        className="relative flex items-end gap-2"
        style={{ height }}
        role="img"
      >
        {/* baseline */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[var(--border)]" />
        {data.map((d, i) => {
          const h = maxValue ? Math.max((d.value / maxValue) * 100, d.value > 0 ? 3 : 0) : 0;
          return (
            <div
              key={i}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              {showValues ? (
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground opacity-80">
                  {d.display ?? `${d.value}${unit}`}
                </span>
              ) : null}
              <div
                className={cn(
                  "w-full max-w-[36px] rounded-t-[4px] transition-[height] duration-700 ease-out",
                  barClassName,
                )}
                style={{ height: `${h}%` }}
                title={d.title ?? `${d.label}: ${d.value}${unit}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 truncate text-center text-[11px] font-medium text-muted-foreground"
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
