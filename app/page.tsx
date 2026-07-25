import { Activity, HeartPulse } from "lucide-react";

import { getDashboardData } from "@/lib/data/dashboard";
import { getWellnessData } from "@/lib/data/wellness";
import { PageHeader } from "@/components/common/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { WellnessView } from "@/components/wellness/wellness-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your hair-care routine at a glance."
        icon={Activity}
      />
      <DashboardView data={await getDashboardData()} />

      <div className="mt-8 flex items-center gap-2 sm:mt-10">
        <HeartPulse className="h-5 w-5 text-health-rose" />
        <h2 className="text-lg font-bold">Wellness</h2>
      </div>
      <div className="mt-4">
        <WellnessView data={await getWellnessData()} />
      </div>
    </>
  );
}
