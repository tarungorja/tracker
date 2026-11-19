import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  History,
  Pill,
  Timer,
} from "lucide-react";

import type { DoseStatus, MedicationActivityAction, PatientOverview } from "@/lib/api/types";
import { formatWhen } from "@/lib/time";
import { cn, pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { Reveal } from "@/components/common/reveal";
import { StatCard } from "@/components/common/stat-card";
import { Heatmap, type HeatmapDay } from "@/components/charts/heatmap";
import { ProgressRing } from "@/components/charts/progress-ring";
import { AutoRefresh } from "@/components/family/auto-refresh";
import { RemindButton } from "@/components/family/remind-button";
import { UnlinkButton } from "@/components/family/unlink-button";

const STATUS: Record<DoseStatus, { label: string; variant: "success" | "default" | "warning" }> = {
  completed: { label: "Taken", variant: "success" },
  upcoming: { label: "Upcoming", variant: "default" },
  pending: { label: "Upcoming", variant: "default" },
  missed: { label: "Missed", variant: "warning" },
};

const ACTIVITY_VERB: Record<MedicationActivityAction, string> = {
  added: "Added",
  updated: "Edited",
  removed: "Removed",
  enabled: "Resumed",
  disabled: "Paused",
};

/** Read-only view of a followed account (the father's dashboard, from the son's side). */
export function PatientOverviewView({ data }: { data: PatientOverview }) {
  const { patient, dashboard, missed } = data;
  const missedKeys = new Set(missed.map((d) => `${d.medicationName}|${d.scheduledTime}`));

  const heatmapDays: HeatmapDay[] = dashboard.heatmap.map((d) => ({
    date: d.date,
    value: d.ratio,
    detail: d.total > 0 ? `${d.completed}/${d.total} done` : "no doses",
  }));
  const doses = [...dashboard.doses].sort((a, b) => a.scheduledMinutes - b.scheduledMinutes);

  return (
    <div className="space-y-4 sm:space-y-5">
      <AutoRefresh seconds={60} />

      <Reveal>
        <Card className={cn(missed.length > 0 && "border-health-amber/50")}>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  missed.length > 0
                    ? "bg-health-amber/15 text-health-amber"
                    : "bg-health-green/12 text-health-green",
                )}
              >
                {missed.length > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-tight">
                  {missed.length > 0
                    ? `${pluralize(missed.length, "dose")} missed today`
                    : "Nothing missed today"}
                </h2>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {missed.length > 0
                    ? missed.map((d) => `${d.medicationName} (${d.scheduledTime})`).join(", ")
                    : dashboard.totalToday === 0
                      ? "No doses are scheduled today."
                      : "Every dose that was due so far has been taken."}
                </p>
              </div>
            </div>
            <RemindButton
              patientId={patient.id}
              patientEmail={patient.email}
              missedCount={missed.length}
              waitSeconds={data.remindAvailableInSeconds}
            />
          </CardContent>
        </Card>
      </Reveal>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="flex h-full flex-col items-center justify-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-6">
              <ProgressRing value={dashboard.progress} size={168}>
                <span className="text-4xl font-bold tabular-nums">{dashboard.progress}%</span>
                <span className="text-xs font-medium text-muted-foreground">today</span>
              </ProgressRing>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-lg font-bold">Today&apos;s progress</h2>
                  <p className="text-sm text-muted-foreground">
                    {dashboard.completedToday} of {pluralize(dashboard.totalToday, "dose")} taken.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat icon={CheckCircle2} label="Taken" value={dashboard.completedToday} className="text-health-green" />
                  <MiniStat icon={Circle} label="Left" value={dashboard.remainingToday} className="text-health-amber" />
                  <MiniStat icon={Pill} label="Total" value={dashboard.totalToday} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.05} className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-1">
          <StatCard
            label="Current streak"
            value={pluralize(dashboard.currentStreak, "day")}
            hint="Days with every dose taken"
            icon={Flame}
            accent="rose"
          />
          <StatCard
            label="Last dose logged"
            value={data.lastDoseLoggedAt ? formatWhen(data.lastDoseLoggedAt) : "Not yet today"}
            hint={
              data.lastRemindedAt
                ? `You reminded them ${formatWhen(data.lastRemindedAt)}`
                : "You haven't sent a reminder"
            }
            icon={Clock}
            accent="blue"
          />
        </Reveal>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Reveal delay={0.1} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                Today&apos;s doses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {doses.length === 0 ? (
                <EmptyState
                  icon={Pill}
                  title="No doses scheduled"
                  description="There are no active medications due today."
                />
              ) : (
                doses.map((dose) => {
                  const status: DoseStatus = dose.completed
                    ? "completed"
                    : missedKeys.has(`${dose.medicationName}|${dose.scheduledTime}`)
                      ? "missed"
                      : "upcoming";
                  const meta = STATUS[status];
                  return (
                    <div
                      key={`${dose.medicationName}-${dose.scheduledTime}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{dose.medicationName}</div>
                        <div className="text-xs text-muted-foreground">
                          {dose.scheduledTime}
                          {dose.completedAt ? ` · taken ${formatWhen(dose.completedAt)}` : ""}
                        </div>
                      </div>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Medication changes
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {data.lastMedicationUpdateAt
                  ? `Last updated ${formatWhen(data.lastMedicationUpdateAt)}`
                  : "No changes in the last 30 days."}
              </p>
            </CardHeader>
            <CardContent>
              {data.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Adding, editing, pausing or removing a medication shows up here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.activity.map((item, index) => (
                    <li
                      key={`${item.at}-${index}`}
                      className="flex items-start justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2"
                    >
                      <span className="min-w-0 text-sm">
                        <span className="font-medium">{ACTIVITY_VERB[item.action]}</span>{" "}
                        <span className="break-words">{item.medicationName}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatWhen(item.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Active medications
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.medications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active medications.</p>
            ) : (
              dashboard.medications.map((med) => (
                <div key={med.id} className="rounded-xl bg-secondary/40 px-3 py-2.5">
                  <div className="truncate text-sm font-medium">{med.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {med.scheduleTimes.join(", ")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.25}>
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

      <div className="flex justify-end">
        <UnlinkButton
          kind="following"
          userId={patient.id}
          email={patient.email}
          redirectTo="/family"
        />
      </div>
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
