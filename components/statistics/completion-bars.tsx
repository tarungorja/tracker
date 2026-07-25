import type { MedicationStat } from "@/lib/data/statistics";
import { cn } from "@/lib/utils";

function barColor(percent: number): string {
  if (percent >= 80) return "bg-health-green";
  if (percent >= 50) return "bg-health-amber";
  return "bg-health-rose";
}

/** Horizontal per-medication adherence bars. */
export function CompletionBars({ stats }: { stats: MedicationStat[] }) {
  if (stats.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No completion data yet. Start checking off doses to see stats here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {stats.map((stat) => (
        <div key={stat.name} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-medium">{stat.name}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {stat.completed}/{stat.total} · {stat.percent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full transition-all", barColor(stat.percent))}
              style={{ width: `${stat.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
