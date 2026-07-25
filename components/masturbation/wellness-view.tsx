import { CalendarDays, Flame, Gauge, Shield, TrendingUp } from "lucide-react";

import type { MasturbationData } from "@/lib/data/masturbation";
import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { Reveal } from "@/components/common/reveal";
import { StatCard } from "@/components/common/stat-card";
import { Heatmap, type HeatmapDay } from "@/components/charts/heatmap";
import { Counter } from "@/components/masturbation/counter";
import { NotesEditor } from "@/components/masturbation/notes-editor";
import { TrendCharts } from "@/components/masturbation/trend-charts";

function intensity(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 0.3;
  if (count === 2) return 0.6;
  if (count === 3) return 0.85;
  return 1;
}

export function WellnessView({ data }: { data: MasturbationData }) {
  const calendarDays: HeatmapDay[] = data.calendar.map((p) => ({
    date: p.date,
    value: intensity(p.count),
    detail: `${p.count}×`,
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Reveal>
          <Counter date={data.todayKey} initialCount={data.todayCount} />
        </Reveal>

        <Reveal delay={0.05} className="grid grid-cols-2 gap-4 sm:gap-5">
          <StatCard
            label="Current streak"
            value={pluralize(data.currentCleanStreak, "day")}
            hint="Clean streak"
            icon={Shield}
            accent="green"
          />
          <StatCard
            label="Longest streak"
            value={pluralize(data.longestCleanStreak, "day")}
            hint="Best clean run"
            icon={Flame}
            accent="violet"
          />
          <StatCard
            label="Avg / week"
            value={data.averagePerWeek}
            hint="Last 12 weeks"
            icon={Gauge}
            accent="blue"
          />
          <StatCard
            label="This year"
            value={data.totalThisYear}
            hint="Total count"
            icon={TrendingUp}
            accent="rose"
          />
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <TrendCharts weekly={data.weekly} monthly={data.monthly} />
      </Reveal>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Reveal delay={0.12}>
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s note</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesEditor date={data.todayKey} initialNotes={data.todayNotes} />
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.16}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-health-rose" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap days={calendarDays} palette="rose" />
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {data.history.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No entries yet"
                description="Your logged days will appear here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {data.history.map((entry) => (
                  <li key={entry.date} className="flex items-start gap-3 py-3">
                    <Badge variant="danger" className="mt-0.5 shrink-0">
                      {entry.count}×
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{entry.label}</p>
                      {entry.notes ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">{entry.notes}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
