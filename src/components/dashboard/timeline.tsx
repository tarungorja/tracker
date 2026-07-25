import { DoseCard } from "./dose-card";
import { STATUS_META } from "@/lib/constants";
import { formatTime12 } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { TimelineDose } from "@/types";

/** Vertical, time-anchored timeline of the day's doses. */
export function Timeline({
  doses,
  dateKey,
}: {
  doses: TimelineDose[];
  dateKey?: string;
}) {
  if (!doses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-muted-foreground">
        No doses scheduled.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4">
      {/* rail line */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 hidden w-px bg-[var(--border)] sm:block"
      />
      {doses.map((dose) => {
        const meta = STATUS_META[dose.status];
        return (
          <li key={dose.id} className="relative sm:pl-8">
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-6 hidden size-3.5 -translate-x-px rounded-full ring-4 ring-[var(--background)] sm:block",
                meta.dot,
              )}
            />
            <span className="mb-1.5 ml-0 hidden text-xs font-medium tabular-nums text-muted-foreground sm:block">
              {formatTime12(dose.scheduledTime)}
            </span>
            <DoseCard dose={dose} dateKey={dateKey} />
          </li>
        );
      })}
    </ol>
  );
}
