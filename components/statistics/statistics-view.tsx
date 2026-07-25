import { CalendarRange, Flame, Target, TrendingUp, XCircle } from "lucide-react";

import type { StatisticsData } from "@/lib/data/statistics";
import { pluralize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/common/reveal";
import { StatCard } from "@/components/common/stat-card";
import { ProgressRing } from "@/components/charts/progress-ring";
import { Heatmap, type HeatmapDay } from "@/components/charts/heatmap";
import { CompletionBars } from "@/components/statistics/completion-bars";

export function StatisticsView({ data }: { data: StatisticsData }) {
  const heatmapDays: HeatmapDay[] = data.heatmap.map((d) => ({
    date: d.date,
    value: d.ratio,
    detail: d.total > 0 ? `${d.completed}/${d.total} done` : "no doses",
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
        <Reveal>
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <ProgressRing value={data.overallPercent} size={132} stroke={12}>
                <span className="text-2xl font-bold tabular-nums">{data.overallPercent}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm text-muted-foreground">Overall completion</p>
                <p className="text-lg font-bold">
                  {data.overallCompleted}/{data.overallTotal} doses
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Last 120 days</p>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <ProgressRing
                value={data.monthPercent}
                size={132}
                stroke={12}
                ringClassName="text-health-blue"
              >
                <span className="text-2xl font-bold tabular-nums">{data.monthPercent}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm text-muted-foreground">This month</p>
                <p className="text-lg font-bold">
                  {data.monthCompleted}/{data.monthTotal} doses
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Since the 1st</p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <StatCard
          label="Current streak"
          value={pluralize(data.currentStreak, "day")}
          icon={Flame}
          accent="rose"
        />
        <StatCard
          label="Longest streak"
          value={pluralize(data.longestStreak, "day")}
          icon={TrendingUp}
          accent="violet"
        />
        <StatCard
          label="Missed doses"
          value={data.missedReminders}
          icon={XCircle}
          accent="amber"
        />
      </Reveal>

      <Reveal delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Medication completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionBars stats={data.medicationStats} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              Adherence heatmap
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
