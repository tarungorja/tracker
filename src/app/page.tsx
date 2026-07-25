import Link from "next/link";
import {
  Percent,
  ListChecks,
  Flame,
  TriangleAlert,
  BellRing,
  Bell,
  PartyPopper,
  ArrowRight,
  Activity,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StatCard } from "@/components/dashboard/stat-card";
import { Timeline } from "@/components/dashboard/timeline";
import { MasturbationCounter } from "@/components/wellness/masturbation-counter";
import { LiveClock } from "@/components/layout/live-clock";
import { ConfigNotice } from "@/components/common/config-notice";
import { getDashboardData } from "@/lib/data/dashboard";
import { isDatabaseConfigured } from "@/lib/env";
import { getParts, formatTime12 } from "@/lib/time";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function greeting(timezone: string) {
  const hour = getParts(new Date(), timezone).hour;
  if (hour < 5) return { text: "Still up?", emoji: "🌙" };
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "👋" };
  if (hour < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Winding down", emoji: "🌙" };
}

export default async function DashboardPage() {
  if (!isDatabaseConfigured) return <ConfigNotice />;

  const { doses, stats, masturbationCount, timezone, emailConfigured } =
    await getDashboardData();
  const hello = greeting(timezone);
  const allDone = stats.total > 0 && stats.pending === 0 && stats.missed === 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card glass className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hello.text} {hello.emoji}
              </p>
              <div className="mt-1">
                <LiveClock timeZone={timezone} variant="hero" />
              </div>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              {allDone
                ? "Everything's handled for today. Beautiful work. 🎉"
                : `You've completed ${stats.completed} of ${stats.total} doses today${
                    stats.remaining ? ` — ${stats.remaining} still to go.` : "."
                  }`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/medications"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                View schedule
              </Link>
              <Link
                href="/calendar"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                History
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <ProgressRing
            value={stats.completionPct}
            className="mx-auto shrink-0 sm:mx-0"
          >
            <span className="text-4xl font-semibold tabular-nums">
              {stats.completionPct}
              <span className="text-xl text-muted-foreground">%</span>
            </span>
            <span className="mt-0.5 text-xs font-medium text-muted-foreground">
              {stats.completed}/{stats.total} done
            </span>
          </ProgressRing>
        </div>
      </Card>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Completion"
          value={`${stats.completionPct}%`}
          hint="of today's doses"
          icon={Percent}
          tone="indigo"
        />
        <StatCard
          label="Remaining"
          value={stats.remaining}
          hint={stats.remaining ? "doses left today" : "all caught up"}
          icon={ListChecks}
          tone="sky"
        />
        <StatCard
          label="Current streak"
          value={stats.currentStreak}
          hint={stats.currentStreak === 1 ? "perfect day" : "perfect days"}
          icon={Flame}
          tone="amber"
        />
        <StatCard
          label="Missed today"
          value={stats.missed}
          hint={stats.missed ? "needs attention" : "none — nice"}
          icon={TriangleAlert}
          tone={stats.missed ? "rose" : "emerald"}
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Today&apos;s timeline
            </h2>
            <span className="text-sm text-muted-foreground">
              {stats.completed}/{stats.total} completed
            </span>
          </div>

          {allDone ? (
            <Card className="mb-4 border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                  <PartyPopper className="size-5" />
                </span>
                <p className="text-sm font-medium">
                  All doses handled for today. Great consistency!
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Timeline doses={doses} />
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <BellRing className="size-4" />
                Next reminder
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.nextReminder ? (
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                    {stats.nextReminder.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {stats.nextReminder.medicationName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats.nextReminder.doseLabel} ·{" "}
                      <span className="tabular-nums">
                        {formatTime12(stats.nextReminder.scheduledTime)}
                      </span>{" "}
                      {stats.nextReminder.relativeDay === "tomorrow"
                        ? "tomorrow"
                        : "today"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming reminders.
                </p>
              )}

              {!emailConfigured ? (
                <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-500/8 p-3 text-xs text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
                  <Bell className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Email reminders are off. Add a Resend API key in{" "}
                    <Link href="/settings" className="font-medium underline">
                      Settings
                    </Link>
                    .
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="size-4" />
                Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MasturbationCounter initialCount={masturbationCount} />
              <Link
                href="/masturbation"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mt-3 w-full",
                )}
              >
                View trends
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[var(--muted)]/40">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="size-4 text-muted-foreground" />
                Today at a glance
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <SummaryRow label="Completed" value={stats.completed} tone="text-emerald-500" />
                <SummaryRow label="Skipped" value={stats.skipped} tone="text-amber-500" />
                <SummaryRow label="Missed" value={stats.missed} tone="text-rose-500" />
                <SummaryRow label="Pending" value={stats.pending} tone="text-muted-foreground" />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--card)] px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-semibold tabular-nums", tone)}>{value}</dd>
    </div>
  );
}
