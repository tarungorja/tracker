"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DoseCard } from "@/components/dashboard/dose-card";
import { fetchDayHistory } from "@/lib/actions/history";
import { weekdayOf, formatDayLabel, pad } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { CalendarMonth, DayStatus } from "@/types";
import type { DayHistory } from "@/lib/data/calendar";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const TONE_CLASSES: Record<DayStatus["tone"], string> = {
  completed:
    "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
  skipped:
    "bg-amber-500/15 text-amber-600 ring-amber-500/25 dark:text-amber-400",
  missed: "bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-400",
  partial:
    "bg-indigo-500/12 text-indigo-600 ring-indigo-500/20 dark:text-indigo-300",
  empty: "bg-transparent text-muted-foreground ring-transparent",
};

function shiftMonth(monthKey: string, delta: number) {
  let [y, m] = monthKey.split("-").map(Number);
  m += delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${pad(m)}`;
}

export function MonthCalendar({
  month,
  todayKey,
}: {
  month: CalendarMonth;
  todayKey: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<DayHistory | null>(null);
  const [loading, startTransition] = React.useTransition();

  const firstWeekday = weekdayOf(`${month.monthKey}-01`);

  function openDay(day: DayStatus) {
    setSelected(day.dateKey);
    setHistory(null);
    setOpen(true);
    startTransition(async () => {
      const result = await fetchDayHistory(day.dateKey);
      setHistory(result);
    });
  }

  const prev = shiftMonth(month.monthKey, -1);
  const next = shiftMonth(month.monthKey, 1);

  return (
    <>
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/calendar?month=${prev}`}
            aria-label="Previous month"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] transition-colors hover:bg-[var(--muted)]"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <h3 className="text-base font-semibold tracking-tight">
            {month.label}
          </h3>
          <Link
            href={`/calendar?month=${next}`}
            aria-label="Next month"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] transition-colors hover:bg-[var(--muted)]"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="pb-1 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {month.days.map((day) => {
            const isToday = day.dateKey === todayKey;
            const dayNum = parseInt(day.dateKey.slice(-2), 10);
            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => openDay(day)}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium ring-1 transition-all hover:scale-[1.05] hover:ring-2",
                  TONE_CLASSES[day.tone],
                  isToday && "ring-2 ring-primary",
                )}
              >
                <span className="tabular-nums">{dayNum}</span>
                {day.masturbationCount > 0 ? (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-rose-400" />
                ) : null}
                {day.hasData ? (
                  <span className="mt-0.5 flex gap-0.5">
                    {day.completed > 0 ? (
                      <span className="size-1 rounded-full bg-emerald-500" />
                    ) : null}
                    {day.skipped > 0 ? (
                      <span className="size-1 rounded-full bg-amber-500" />
                    ) : null}
                    {day.missed > 0 ? (
                      <span className="size-1 rounded-full bg-rose-500" />
                    ) : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <LegendDot className="bg-emerald-500" label="Completed" />
          <LegendDot className="bg-amber-500" label="Skipped" />
          <LegendDot className="bg-rose-500" label="Missed" />
          <LegendDot className="bg-indigo-500" label="In progress" />
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-400" />
            Wellness activity
          </span>
        </div>
      </Card>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? formatDayLabel(selected) : ""}
        description="Tap any dose to update its status for this day."
      >
        {loading || !history ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {history.masturbationCount > 0 ? (
              <div className="rounded-2xl bg-rose-500/8 px-4 py-2.5 text-sm ring-1 ring-rose-500/15">
                Wellness count:{" "}
                <span className="font-semibold">{history.masturbationCount}</span>
              </div>
            ) : null}
            {history.doses.length ? (
              history.doses.map((dose) => (
                <DoseCard key={dose.id} dose={dose} dateKey={selected ?? undefined} />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No records for this day.
              </p>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", className)} />
      {label}
    </span>
  );
}
