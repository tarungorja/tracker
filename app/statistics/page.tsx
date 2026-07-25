import { BarChart3 } from "lucide-react";

import { getStatisticsData } from "@/lib/data/statistics";
import { PageHeader } from "@/components/common/page-header";
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
      />
      <StatisticsView data={await getStatisticsData()} />
    </>
  );
}
