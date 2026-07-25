import { HeartPulse } from "lucide-react";

import { getWellnessData } from "@/lib/data/wellness";
import { PageHeader } from "@/components/common/page-header";
import { WellnessView } from "@/components/wellness/wellness-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Wellness" };

export default async function WellnessPage() {
  return (
    <>
      <PageHeader
        title="Wellness Tracker"
        description="Track your daily count, streaks and trends — fully private."
        icon={HeartPulse}
      />
      <WellnessView data={await getWellnessData()} />
    </>
  );
}
