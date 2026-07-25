import { weekdayOf, formatDayLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

interface HeatmapCell {
  dateKey: string;
  count: number;
}

/**
 * GitHub-style contribution heatmap. Sequential single hue (rose) where the
 * lightest step means "none" and recedes toward the surface.
 */
const LEVELS = [
  "bg-[var(--muted)]",
  "bg-rose-500/25",
  "bg-rose-500/45",
  "bg-rose-500/70",
  "bg-rose-500",
];

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 4;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

export function Heatmap({ data }: { data: HeatmapCell[] }) {
  if (!data.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  // Build week columns aligned to weekday (Sun top → Sat bottom).
  const cells: (HeatmapCell | null)[] = [];
  const firstWeekday = weekdayOf(data[0].dateKey);
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (const d of data) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (HeatmapCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, ci) =>
              cell ? (
                <span
                  key={ci}
                  className={cn(
                    "size-3 rounded-[3px]",
                    LEVELS[levelFor(cell.count, max)],
                  )}
                  title={`${formatDayLabel(cell.dateKey)}: ${cell.count}`}
                />
              ) : (
                <span key={ci} className="size-3 rounded-[3px] opacity-0" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {LEVELS.map((lvl, i) => (
          <span key={i} className={cn("size-3 rounded-[3px]", lvl)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
