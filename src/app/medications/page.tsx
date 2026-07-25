import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Pill } from "lucide-react";
import { PageIntro } from "@/components/common/page-intro";
import { ConfigNotice } from "@/components/common/config-notice";
import { ScheduleCard } from "@/components/medications/schedule-card";
import { buttonVariants } from "@/components/ui/button";
import { MEDICATIONS, TOTAL_DAILY_DOSES } from "@/lib/constants";
import { isDatabaseConfigured } from "@/lib/env";
import { getSettings } from "@/lib/data/settings";
import { ensureDayLogs, reconcileMissed, getDayDoses } from "@/lib/data/logs";
import { getDateKey } from "@/lib/time";
import type { DoseStatus } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Schedule" };

export default async function MedicationsPage() {
  if (!isDatabaseConfigured) return <ConfigNotice />;

  const settings = await getSettings();
  const todayKey = getDateKey(settings.timezone);
  await ensureDayLogs(todayKey);
  await reconcileMissed(settings.timezone);
  const doses = await getDayDoses(todayKey);

  const statuses: Record<string, DoseStatus> = {};
  for (const dose of doses) statuses[dose.doseKey] = dose.status;

  return (
    <div>
      <PageIntro
        title="Medication Schedule"
        description={`${MEDICATIONS.length} medications · ${TOTAL_DAILY_DOSES} doses each day`}
        action={
          <Link
            href="/"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <Pill className="size-4" />
            Track today
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {MEDICATIONS.map((medication) => (
          <ScheduleCard
            key={medication.slug}
            medication={medication}
            statuses={statuses}
          />
        ))}
      </div>
    </div>
  );
}
