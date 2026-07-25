import { CheckCircle2 } from "lucide-react";

import type { TodayData } from "@/lib/data/today";
import { cn, percent } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/common/reveal";
import { DoseItem } from "@/components/doses/dose-item";

const DOT_STATE: Record<string, string> = {
  done: "border-health-green bg-health-green text-white",
  now: "border-primary bg-primary/15 text-primary",
  future: "border-border bg-background text-muted-foreground",
};

export function Timeline({ data }: { data: TodayData }) {
  const pct = percent(data.completed, data.total);

  return (
    <div className="space-y-5">
      <Reveal>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed today</p>
                <p className="text-2xl font-bold tabular-nums">
                  {data.completed}
                  <span className="text-base font-medium text-muted-foreground">
                    {" "}
                    / {data.total}
                  </span>
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-health-green/12 text-health-green">
                <CheckCircle2 className="h-6 w-6" />
              </span>
            </div>
            <Progress
              value={pct}
              className="mt-4"
              indicatorClassName="bg-gradient-to-r from-health-green to-health-blue"
            />
          </CardContent>
        </Card>
      </Reveal>

      <div className="relative pl-4">
        {/* vertical spine */}
        <div className="absolute bottom-2 left-[1.35rem] top-2 w-px bg-border" aria-hidden />

        <div className="space-y-4">
          {data.slots.map((slot, i) => {
            const allDone = slot.doses.every((d) => d.completed);
            const isNow =
              slot.minutes <= data.nowMinutes &&
              data.nowMinutes < slot.minutes + 120 &&
              !allDone;
            const dotState = allDone ? "done" : isNow ? "now" : slot.minutes > data.nowMinutes ? "future" : "now";

            return (
              <Reveal key={slot.time} delay={i * 0.06}>
                <div className="relative flex gap-4">
                  <div className="relative z-10 flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2",
                        DOT_STATE[dotState],
                      )}
                    >
                      {allDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    </span>
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-sm font-bold">{slot.time}</span>
                      {isNow ? (
                        <span className="text-xs font-medium text-primary">now</span>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      {slot.doses.map((dose) => (
                        <DoseItem
                          key={`${dose.medicationName}-${dose.scheduledTime}`}
                          medicationName={dose.medicationName}
                          scheduledTime={dose.scheduledTime}
                          scheduledMinutes={dose.scheduledMinutes}
                          date={data.todayKey}
                          initialCompleted={dose.completed}
                          nowMinutes={data.nowMinutes}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
