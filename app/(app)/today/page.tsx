import { CalendarCheck } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { getTodayData } from "@/lib/data/today";
import { PageHeader } from "@/components/common/page-header";
import { Timeline } from "@/components/today/timeline";

export const dynamic = "force-dynamic";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Today"
        description="Your dose timeline for the day."
        icon={CalendarCheck}
      />
      <Timeline data={await getTodayData(user.id)} />
    </>
  );
}
