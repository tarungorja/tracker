import { CalendarCheck } from "lucide-react";

import { isConfigured } from "@/lib/env";
import { getTodayData } from "@/lib/data/today";
import { ConfigNotice } from "@/components/common/config-notice";
import { PageHeader } from "@/components/common/page-header";
import { Timeline } from "@/components/today/timeline";

export const dynamic = "force-dynamic";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const configured = isConfigured();

  return (
    <>
      <PageHeader
        title="Today"
        description="Your reminder timeline for the day."
        icon={CalendarCheck}
      />
      <ConfigNotice />
      {configured ? <Timeline data={await getTodayData()} /> : null}
    </>
  );
}
