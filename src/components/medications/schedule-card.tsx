import { Clock, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COLOR_META, STATUS_META, type MedicationSeed } from "@/lib/constants";
import { formatTime12 } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { DoseStatus } from "@/types";

export function ScheduleCard({
  medication,
  statuses,
}: {
  medication: MedicationSeed;
  statuses: Record<string, DoseStatus>;
}) {
  const color = COLOR_META[medication.color];

  return (
    <Card className="overflow-hidden">
      <div className={cn("h-1.5 w-full bg-gradient-to-r", color.gradient)} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl ring-1",
              color.soft,
              color.ring,
            )}
          >
            <span aria-hidden>{medication.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold leading-tight">
              {medication.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {medication.summary}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {medication.doses.map((dose) => (
                <span
                  key={dose.key}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    color.soft,
                    color.text,
                  )}
                >
                  <Clock className="size-3" />
                  {dose.label} · {formatTime12(dose.time)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {medication.doses.map((dose) => {
            const status = statuses[dose.key] ?? "pending";
            const meta = STATUS_META[status];
            return (
              <div
                key={dose.key}
                className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {dose.label}
                    <span className="ml-2 font-normal tabular-nums text-muted-foreground">
                      {formatTime12(dose.time)}
                    </span>
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium",
                      meta.text,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </span>
                </div>
                <ul className="space-y-1">
                  {dose.instructions.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          color.solid,
                        )}
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                {dose.warnings?.length ? (
                  <div className="mt-3 rounded-xl bg-rose-500/8 p-3 ring-1 ring-rose-500/20">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500">
                      <TriangleAlert className="size-3.5" />
                      Stop medication if
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {dose.warnings.map((w, i) => (
                        <Badge key={i} variant="missed">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
