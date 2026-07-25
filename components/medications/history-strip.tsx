import type { MedHistoryDay } from "@/lib/data/medications";
import { shortDateLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

const LEVELS = [
  "bg-secondary",
  "bg-health-green/30",
  "bg-health-green/55",
  "bg-health-green/75",
  "bg-health-green",
];

function level(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio < 0.34) return 1;
  if (ratio < 0.67) return 2;
  if (ratio < 1) return 3;
  return 4;
}

export function HistoryStrip({
  history,
  todayKey,
}: {
  history: MedHistoryDay[];
  todayKey: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {history.map((day) => (
        <div
          key={day.date}
          title={`${shortDateLabel(day.date)} — ${day.completed}/${day.total}`}
          className={cn(
            "h-6 flex-1 rounded-md transition-transform hover:scale-110",
            LEVELS[level(day.ratio)],
            day.date === todayKey && "ring-2 ring-primary/40",
          )}
        />
      ))}
    </div>
  );
}
