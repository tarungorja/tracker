import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  Pill,
  Timer,
} from "lucide-react";

import type { DashboardData } from "@/lib/data/dashboard";
import { untilLabel } from "@/lib/data/dashboard";
import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { Reveal } from "@/components/common/reveal";
import { StatCard } from "@/components/common/stat-card";
import { Heatmap, type HeatmapDay } from "@/components/charts/heatmap";
import { ProgressRing } from "@/components/charts/progress-ring";
import { DoseItem } from "@/components/doses/dose-item";

export function DashboardView({ data }: { data: DashboardData }) {
  const heatmapDays: HeatmapDay[] = data.heatmap.map((d) => ({
    date: d.date,
    value: d.ratio,
    detail: d.total > 0 ? `${d.completed}/${d.total} done` : "no doses",
  }));

  const upcomingDoses = [...data.doses].sort((a, b) => a.scheduledMinutes - b.scheduledMinutes);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="flex h-full flex-col items-center justify-center gap-6 p-6 sm:flex-row sm:gap-8">
              <ProgressRing value={data.progress} size={168}>
                <span className="text-4xl font-bold tabular-nums">{data.progress}%</span>
                <span className="text-xs font-medium text-muted-foreground">today</span>
              </ProgressRing>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-lg font-bold">Today&apos;s progress</h2>
                  <p className="text-sm text-muted-foreground">
                    {data.remainingToday === 0 && data.totalToday > 0
                      ? "All doses complete — great job! 🎉"
                      : `${pluralize(data.remainingToday, "dose")} left to complete.`}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat
                    icon={CheckCircle2}
                    label="Done"
                    value={data.completedToday}
                    className="text-health-green"
                  />
                  <MiniStat
                    icon={Circle}
                    label="Left"
                    value={data.remainingToday}
                    className="text-health-amber"
                  />
                  <MiniStat
                    icon={Pill}
                    label="Total"
                    value={data.totalToday}
                    className="text-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.05} className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-1">
          <StatCard
            label="Current streak"
            value={pluralize(data.currentStreak, "day")}
            hint="Days with every dose done"
            icon={Flame}
            accent="rose"
          />
          <NextReminderCard data={data} />
        </Reveal>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Reveal delay={0.1} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                Today&apos;s doses
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/today">
                  Timeline <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingDoses.length === 0 ? (
                <EmptyState
                  icon={Pill}
                  title="No doses scheduled"
                  description="Enable a medication to see its doses here."
                />
              ) : (
                upcomingDoses.map((dose) => (
                  <DoseItem
                    key={`${dose.medicationName}-${dose.scheduledTime}`}
                    medicationName={dose.medicationName}
                    scheduledTime={dose.scheduledTime}
                    scheduledMinutes={dose.scheduledMinutes}
                    date={data.todayKey}
                    initialCompleted={dose.completed}
                    nowMinutes={data.nowMinutes}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Medications
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/medications">
                  All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active medications.</p>
              ) : (
                data.medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm font-medium">{med.name}</span>
                    <Badge variant="secondary">
                      {pluralize(med.scheduleTimes.length, "time")}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Heatmap days={heatmapDays} palette="green" />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-3 text-center">
      <Icon className={`mx-auto h-4 w-4 ${className ?? ""}`} />
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function NextReminderCard({ data }: { data: DashboardData }) {
  const next = data.nextReminder;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Next dose
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-health-blue/12 text-health-blue">
          <Timer className="h-4 w-4" />
        </span>
      </div>
      {next ? (
        <>
          <div className="mt-2 truncate text-lg font-bold">{next.medicationName}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {next.scheduledTime}
            {" · "}
            <span className="font-medium text-health-blue">
              {next.isTomorrow ? "tomorrow" : untilLabel(next.minutesUntil)}
            </span>
          </div>
        </>
      ) : (
        <div className="mt-2 text-sm text-muted-foreground">Nothing scheduled.</div>
      )}
    </Card>
  );
}
