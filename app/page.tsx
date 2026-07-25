import { Activity } from "lucide-react";

import { isConfigured } from "@/lib/env";
import { getDashboardData } from "@/lib/data/dashboard";
import { ConfigNotice } from "@/components/common/config-notice";
import { PageHeader } from "@/components/common/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const configured = isConfigured();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your hair-care routine at a glance."
        icon={Activity}
      />
      <ConfigNotice />
      {configured ? <DashboardView data={await getDashboardData()} /> : null}
    </>
  );
}
