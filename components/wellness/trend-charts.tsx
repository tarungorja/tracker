"use client";

import type { CountPoint } from "@/lib/data/wellness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, type BarDatum } from "@/components/charts/bar-chart";

function toBars(points: CountPoint[]): BarDatum[] {
  return points.map((p) => ({ label: p.label, value: p.count, caption: p.label }));
}

export function TrendCharts({
  weekly,
  monthly,
}: {
  weekly: CountPoint[];
  monthly: CountPoint[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <BarChart
              data={toBars(weekly)}
              barClassName="bg-health-rose/80 group-hover:bg-health-rose"
              labelEvery={1}
              formatValue={(v) => `${v}×`}
            />
          </TabsContent>
          <TabsContent value="monthly">
            <BarChart
              data={toBars(monthly)}
              barClassName="bg-health-rose/80 group-hover:bg-health-rose"
              labelEvery={5}
              formatValue={(v) => `${v}×`}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
