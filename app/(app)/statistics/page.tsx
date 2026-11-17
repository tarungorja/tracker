import { BarChart3 } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { getStatisticsData } from "@/lib/data/statistics";
import { PageHeader } from "@/components/common/page-header";
import { StatisticsView } from "@/components/statistics/statistics-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Statistics" };

export default async function StatisticsPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Statistics"
        description="Adherence, streaks and completion history."
        icon={BarChart3}
      />
      <StatisticsView data={await getStatisticsData(user.id)} />
    </>
  );
}
