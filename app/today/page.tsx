import { CalendarCheck } from "lucide-react";

import { getTodayData } from "@/lib/data/today";
import { PageHeader } from "@/components/common/page-header";
import { Timeline } from "@/components/today/timeline";

export const dynamic = "force-dynamic";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  return (
    <>
      <PageHeader
        title="Today"
        description="Your dose timeline for the day."
        icon={CalendarCheck}
      />
      <Timeline data={await getTodayData()} />
    </>
  );
}
