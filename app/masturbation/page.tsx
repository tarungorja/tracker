import { HeartPulse } from "lucide-react";

import { isConfigured } from "@/lib/env";
import { getMasturbationData } from "@/lib/data/masturbation";
import { ConfigNotice } from "@/components/common/config-notice";
import { PageHeader } from "@/components/common/page-header";
import { WellnessView } from "@/components/masturbation/wellness-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Wellness" };

export default async function MasturbationPage() {
  const configured = isConfigured();

  return (
    <>
      <PageHeader
        title="Wellness Tracker"
        description="Track your daily count, streaks and trends — fully private."
        icon={HeartPulse}
      />
      <ConfigNotice />
      {configured ? <WellnessView data={await getMasturbationData()} /> : null}
    </>
  );
}
