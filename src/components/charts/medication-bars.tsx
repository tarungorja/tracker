import { COLOR_META, type MedicationColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface MedicationBar {
  name: string;
  emoji: string;
  color: MedicationColor;
  completionPct: number;
  completed: number;
  skipped: number;
  missed: number;
}

/**
 * Horizontal per-medication adherence bars. Categorical color follows the
 * medication (identity), always paired with an emoji + name direct label so
 * identity is never color-alone.
 */
export function MedicationBars({ data }: { data: MedicationBar[] }) {
  return (
    <ul className="space-y-4">
      {data.map((m) => {
        const color = COLOR_META[m.color];
        return (
          <li key={m.name}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium">
                <span aria-hidden>{m.emoji}</span>
                <span className="truncate">{m.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {m.completionPct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", color.gradient)}
                style={{ width: `${m.completionPct}%` }}
                title={`${m.name}: ${m.completed} taken · ${m.skipped} skipped · ${m.missed} missed`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
