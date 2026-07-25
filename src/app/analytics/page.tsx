import type { Metadata } from "next";
import {
  Flame,
  Award,
  CheckCircle2,
  SkipForward,
  TriangleAlert,
  Hourglass,
} from "lucide-react";
import { PageIntro } from "@/components/common/page-intro";
import { ConfigNotice } from "@/components/common/config-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { BarChart } from "@/components/charts/bar-chart";
import { MedicationBars } from "@/components/charts/medication-bars";
import { getAnalytics } from "@/lib/data/analytics";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

function formatDelay(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes === 0) return "On time";
  if (minutes > 0) return `${minutes} min late`;
  return `${Math.abs(minutes)} min early`;
}

export default async function AnalyticsPage() {
  if (!isDatabaseConfigured) return <ConfigNotice />;

  const a = await getAnalytics();

  return (
    <div className="space-y-6">
      <PageIntro title="Analytics" description={a.rangeLabel} />

      {/* Top row: donut + key numbers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Overall completion
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <ProgressRing value={a.completionPct} size={180}>
              <span className="text-4xl font-semibold tabular-nums">
                {a.completionPct}
                <span className="text-xl text-muted-foreground">%</span>
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {a.totalTaken} doses taken
              </span>
            </ProgressRing>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard label="Current streak" value={a.currentStreak} hint="perfect days" icon={Flame} tone="amber" />
          <StatCard label="Longest streak" value={a.longestStreak} hint="perfect days" icon={Award} tone="indigo" />
          <StatCard label="Doses taken" value={a.totalTaken} hint="completed" icon={CheckCircle2} tone="emerald" />
          <StatCard label="Doses missed" value={a.totalMissed} hint="not taken" icon={TriangleAlert} tone="rose" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Weekly adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={a.weeklyAdherence.map((d) => ({
                label: d.label,
                value: d.pct,
                display: `${d.pct}%`,
                title: `${d.dateKey}: ${d.pct}% completed`,
              }))}
              max={100}
              unit="%"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly adherence</CardTitle>
          </CardHeader>
          <CardContent>
            {a.monthlyAdherence.length ? (
              <BarChart
                data={a.monthlyAdherence.map((d) => ({
                  label: d.label,
                  value: d.pct,
                  display: `${d.pct}%`,
                }))}
                max={100}
                unit="%"
                barClassName="bg-gradient-to-t from-sky-500 to-cyan-400"
              />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Not enough data yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per medication + highlights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Adherence by medication</CardTitle>
          </CardHeader>
          <CardContent>
            <MedicationBars data={a.perMedication} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <SkipForward className="size-4" /> Most skipped
              </p>
              {a.mostSkipped ? (
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  <span>{a.mostSkipped.emoji}</span>
                  <span className="truncate">{a.mostSkipped.name}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    ×{a.mostSkipped.count}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">None skipped 🎉</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <TriangleAlert className="size-4" /> Most missed
              </p>
              {a.mostMissed ? (
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  <span>{a.mostMissed.emoji}</span>
                  <span className="truncate">{a.mostMissed.name}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    ×{a.mostMissed.count}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">None missed 🎉</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hourglass className="size-4" /> Avg. completion time
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatDelay(a.averageCompletionMinutes)}
              </p>
              <p className="text-xs text-muted-foreground">relative to schedule</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
