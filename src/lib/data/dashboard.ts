import { getSettings } from "@/lib/data/settings";
import { ensureDayLogs, reconcileMissed, getDayDoses } from "@/lib/data/logs";
import {
  getDailyAggregates,
  computeMedicationStreak,
  getMasturbationCounts,
} from "@/lib/data/aggregate";
import { ALL_DOSES } from "@/lib/constants";
import { isEmailConfigured } from "@/lib/env";
import {
  getDateKey,
  getMinutesOfDay,
  timeToMinutes,
  addDaysKey,
} from "@/lib/time";
import { round } from "@/lib/utils";
import type { DashboardData, NextReminder, TimelineDose } from "@/types";

const DOSES_BY_TIME = [...ALL_DOSES].sort(
  (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
);

function computeNextReminder(timezone: string): NextReminder | null {
  const nowMinutes = getMinutesOfDay(timezone);
  const upcomingToday = DOSES_BY_TIME.find(
    (d) => timeToMinutes(d.time) > nowMinutes,
  );
  const target = upcomingToday ?? DOSES_BY_TIME[0];
  if (!target) return null;
  return {
    scheduledTime: target.time,
    medicationName: target.medication.name,
    doseLabel: target.label,
    emoji: target.medication.emoji,
    relativeDay: upcomingToday ? "today" : "tomorrow",
  };
}

function computeStats(doses: TimelineDose[], streak: number, timezone: string) {
  const total = doses.length;
  const completed = doses.filter((d) => d.status === "completed").length;
  const skipped = doses.filter((d) => d.status === "skipped").length;
  const missed = doses.filter((d) => d.status === "missed").length;
  const pending = doses.filter((d) => d.status === "pending").length;
  return {
    total,
    completed,
    skipped,
    missed,
    pending,
    remaining: pending,
    completionPct: total ? round((completed / total) * 100) : 0,
    currentStreak: streak,
    nextReminder: computeNextReminder(timezone),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const settings = await getSettings();
  const timezone = settings.timezone;
  const todayKey = getDateKey(timezone);

  await ensureDayLogs(todayKey);
  await reconcileMissed(timezone);

  const doses = await getDayDoses(todayKey);

  const aggregates = await getDailyAggregates(
    addDaysKey(todayKey, -200),
    todayKey,
  );
  const streak = computeMedicationStreak(aggregates, todayKey);

  const masturbationMap = await getMasturbationCounts(todayKey, todayKey);
  const masturbationCount = masturbationMap.get(todayKey) ?? 0;

  return {
    dateKey: todayKey,
    timezone,
    doses,
    stats: computeStats(doses, streak, timezone),
    masturbationCount,
    emailConfigured: isEmailConfigured,
  };
}
