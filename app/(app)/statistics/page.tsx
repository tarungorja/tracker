import { BarChart3 } from "lucide-react";

import { getStatisticsData } from "@/lib/api/server";
import { PageHeader } from "@/components/common/page-header";
import { ReportActions } from "@/components/statistics/report-actions";
import { StatisticsView } from "@/components/statistics/statistics-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Statistics" };

export default async function StatisticsPage() {
  return (
    <>
      <PageHeader
        title="Statistics"
        description="Adherence, streaks and completion history."
        icon={BarChart3}
        action={<ReportActions />}
      />
      <StatisticsView data={await getStatisticsData()} />
    </>
  );
}
