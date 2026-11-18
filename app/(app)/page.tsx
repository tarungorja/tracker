import { Activity } from "lucide-react";

import { getDashboardData } from "@/lib/api/server";
import { PageHeader } from "@/components/common/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

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
    </>
  );
}
