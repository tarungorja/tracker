import type { Metadata } from "next";
import { CheckCircle2, SkipForward, TriangleAlert, Percent } from "lucide-react";
import { PageIntro } from "@/components/common/page-intro";
import { ConfigNotice } from "@/components/common/config-notice";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { getMonthData } from "@/lib/data/calendar";
import { getSettings } from "@/lib/data/settings";
import { isDatabaseConfigured } from "@/lib/env";
import { getDateKey } from "@/lib/time";
import { round } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendar" };

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  if (!isDatabaseConfigured) return <ConfigNotice />;

  const { month: monthParam } = await searchParams;
  const monthKey = monthParam && MONTH_RE.test(monthParam) ? monthParam : undefined;

  const month = await getMonthData(monthKey);
  const settings = await getSettings();
  const todayKey = getDateKey(settings.timezone);

  const totals = month.days.reduce(
    (acc, d) => {
      acc.completed += d.completed;
      acc.skipped += d.skipped;
      acc.missed += d.missed;
      return acc;
    },
    { completed: 0, skipped: 0, missed: 0 },
  );
  const resolved = totals.completed + totals.skipped + totals.missed;
  const adherence = resolved ? round((totals.completed / resolved) * 100) : 0;

  return (
    <div>
      <PageIntro
        title="Calendar"
        description="Your adherence at a glance. Tap any day to review or backfill it."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Adherence"
          value={`${adherence}%`}
          hint={month.label}
          icon={Percent}
          tone="indigo"
        />
        <StatCard
          label="Completed"
          value={totals.completed}
          hint="doses this month"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Skipped"
          value={totals.skipped}
          hint="doses this month"
          icon={SkipForward}
          tone="amber"
        />
        <StatCard
          label="Missed"
          value={totals.missed}
          hint="doses this month"
          icon={TriangleAlert}
          tone="rose"
        />
      </div>

      <MonthCalendar month={month} todayKey={todayKey} />
    </div>
  );
}
