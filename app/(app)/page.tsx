import { Activity } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/common/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your hair-care routine at a glance."
        icon={Activity}
      />
      <DashboardView data={await getDashboardData(user.id)} />
    </>
  );
}
