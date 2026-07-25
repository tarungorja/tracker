import { shortDateLabel, weekdayOfKey } from "@/lib/time";
import { cn } from "@/lib/utils";

export interface HeatmapDay {
  date: string;
  value: number;
  detail?: string;
}

type Palette = "green" | "rose" | "violet";

const PALETTES: Record<Palette, string[]> = {
  green: [
    "bg-secondary",
    "bg-health-green/25",
    "bg-health-green/45",
    "bg-health-green/70",
    "bg-health-green",
  ],
  rose: [
    "bg-secondary",
    "bg-health-rose/25",
    "bg-health-rose/45",
    "bg-health-rose/70",
    "bg-health-rose",
  ],
  violet: [
    "bg-secondary",
    "bg-health-violet/25",
    "bg-health-violet/45",
    "bg-health-violet/70",
    "bg-health-violet",
  ],
};

function levelFor(value: number): number {
  if (value <= 0) return 0;
  if (value < 0.34) return 1;
  if (value < 0.67) return 2;
  if (value < 1) return 3;
  return 4;
}

interface HeatmapProps {
  days: HeatmapDay[];
  palette?: Palette;
  className?: string;
}

export function Heatmap({ days, palette = "green", className }: HeatmapProps) {
  const colors = PALETTES[palette];

  const weeks: (HeatmapDay | null)[][] = [];
  let current: (HeatmapDay | null)[] = [];

  if (days.length > 0) {
    const firstWeekday = weekdayOfKey(days[0]!.date);
    for (let i = 0; i < firstWeekday; i++) current.push(null);
  }

  for (const day of days) {
    current.push(day);
    if (weekdayOfKey(day.date) === 6) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="h-3.5 w-3.5 rounded-[4px]" />;
              const level = levelFor(day.value);
              return (
                <div
                  key={di}
                  title={`${shortDateLabel(day.date)}${day.detail ? ` — ${day.detail}` : ""}`}
                  className={cn(
                    "h-3.5 w-3.5 rounded-[4px] transition-transform hover:scale-125",
                    colors[level],
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {colors.map((c, i) => (
          <span key={i} className={cn("h-3 w-3 rounded-[3px]", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
