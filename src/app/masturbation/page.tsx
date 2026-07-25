import type { Metadata } from "next";
import { ShieldCheck, TrendingUp, Gauge, Activity, StickyNote } from "lucide-react";
import { PageIntro } from "@/components/common/page-intro";
import { ConfigNotice } from "@/components/common/config-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { MasturbationCounter } from "@/components/wellness/masturbation-counter";
import { WellnessNotesEditor } from "@/components/wellness/notes-editor";
import { BarChart } from "@/components/charts/bar-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { getMasturbationData } from "@/lib/data/masturbation";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wellness" };

const roseBar = "bg-gradient-to-t from-rose-500 to-pink-400";

export default async function MasturbationPage() {
  if (!isDatabaseConfigured) return <ConfigNotice />;

  const d = await getMasturbationData();

  return (
    <div className="space-y-6">
      <PageIntro
        title="Wellness Tracker"
        description="Track your activity, spot patterns and build streaks — kept entirely private."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Counter */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MasturbationCounter initialCount={d.todayCount} variant="full" />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard
            label="Clean streak"
            value={d.currentStreak}
            hint={d.currentStreak === 1 ? "day without" : "days without"}
            icon={ShieldCheck}
            tone="emerald"
          />
          <StatCard
            label="Highest daily"
            value={d.highestDaily}
            hint="peak in a day"
            icon={TrendingUp}
            tone="rose"
          />
          <StatCard
            label="Monthly avg"
            value={d.monthlyAverage}
            hint="per day this month"
            icon={Gauge}
            tone="indigo"
          />
          <StatCard
            label="All time"
            value={d.totalAllTime}
            hint="total recorded"
            icon={Activity}
            tone="sky"
          />
        </div>
      </div>

      {/* Trends */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Trends</CardTitle>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <div className="mt-6 w-full">
              <TabsContent value="daily">
                <BarChart
                  data={d.daily.map((x) => ({
                    label: x.dateKey.slice(-2),
                    value: x.count,
                    title: `${x.dateKey}: ${x.count}`,
                  }))}
                  unit=""
                  barClassName={roseBar}
                />
              </TabsContent>
              <TabsContent value="weekly">
                <BarChart
                  data={d.weekly.map((x) => ({ label: x.label, value: x.count }))}
                  barClassName={roseBar}
                />
              </TabsContent>
              <TabsContent value="monthly">
                <BarChart
                  data={d.monthly.map((x) => ({ label: x.label, value: x.count }))}
                  barClassName={roseBar}
                />
              </TabsContent>
              <TabsContent value="yearly">
                {d.yearly.length ? (
                  <BarChart
                    data={d.yearly.map((x) => ({ label: x.label, value: x.count }))}
                    barClassName={roseBar}
                  />
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Not enough history yet.
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Heatmap + notes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Activity heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <Heatmap data={d.heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <StickyNote className="size-4" />
              Today&apos;s note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WellnessNotesEditor initialNotes={d.todayNotes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
