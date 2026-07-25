import { BarChart3 } from "lucide-react";

import { isConfigured } from "@/lib/env";
import { getStatisticsData } from "@/lib/data/statistics";
import { ConfigNotice } from "@/components/common/config-notice";
import { PageHeader } from "@/components/common/page-header";
import { StatisticsView } from "@/components/statistics/statistics-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Statistics" };

export default async function StatisticsPage() {
  const configured = isConfigured();

  return (
    <>
      <PageHeader
        title="Statistics"
        description="Adherence, streaks and reminder history."
        icon={BarChart3}
      />
      <ConfigNotice />
      {configured ? <StatisticsView data={await getStatisticsData()} /> : null}
    </>
  );
}
