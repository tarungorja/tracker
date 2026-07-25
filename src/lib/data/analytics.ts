import { connectToDatabase } from "@/lib/db";
import { DailyLog } from "@/lib/models";
import { getSettings } from "@/lib/data/settings";
import { reconcileMissed } from "@/lib/data/logs";
import {
  getDailyAggregates,
  computeMedicationStreak,
  isPerfectDay,
} from "@/lib/data/aggregate";
import { MEDICATIONS, type MedicationColor } from "@/lib/constants";
import {
  getDateKey,
  addDaysKey,
  rangeKeys,
  dateKeyToDate,
  getMinutesOfDay,
  timeToMinutes,
} from "@/lib/time";
import { round } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

const RANGE_DAYS = 180;

function weekdayShort(dateKey: string): string {
  return dateKeyToDate(dateKey).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

function monthShort(monthKey: string): string {
  return dateKeyToDate(`${monthKey}-15`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function computeLongestStreak(
  aggregates: Map<
    string,
    { completed: number; total: number; skipped: number; missed: number; pending: number; dateKey: string }
  >,
  sinceKey: string,
  untilKey: string,
): number {
  let longest = 0;
  let current = 0;
  for (const key of rangeKeys(sinceKey, untilKey)) {
    if (isPerfectDay(aggregates.get(key))) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  await connectToDatabase();
  const settings = await getSettings();
  const timezone = settings.timezone;
  await reconcileMissed(timezone);

  const todayKey = getDateKey(timezone);
  const sinceKey = addDaysKey(todayKey, -(RANGE_DAYS - 1));
  const aggregates = await getDailyAggregates(sinceKey, todayKey);

  // Overall totals
  let totalTaken = 0;
  let totalSkipped = 0;
  let totalMissed = 0;
  let totalResolved = 0;
  for (const agg of aggregates.values()) {
    totalTaken += agg.completed;
    totalSkipped += agg.skipped;
    totalMissed += agg.missed;
    totalResolved += agg.completed + agg.skipped + agg.missed;
  }
  const completionPct = totalResolved
    ? round((totalTaken / totalResolved) * 100)
    : 0;

  // Weekly adherence (last 7 days, per-day completion %)
  const weeklyAdherence = rangeKeys(addDaysKey(todayKey, -6), todayKey).map(
    (key) => {
      const agg = aggregates.get(key);
      const pct = agg && agg.total ? round((agg.completed / agg.total) * 100) : 0;
      return { label: weekdayShort(key), dateKey: key, pct };
    },
  );

  // Monthly adherence (group range by month)
  const monthly = new Map<string, { completed: number; total: number }>();
  for (const [key, agg] of aggregates) {
    const mk = key.slice(0, 7);
    const cur = monthly.get(mk) ?? { completed: 0, total: 0 };
    cur.completed += agg.completed;
    cur.total += agg.total;
    monthly.set(mk, cur);
  }
  const monthlyAdherence = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([mk, v]) => ({
      label: monthShort(mk),
      pct: v.total ? round((v.completed / v.total) * 100) : 0,
    }));

  // Per-medication breakdown
  const medRows = await DailyLog.aggregate<{
    _id: { slug: string; status: string };
    count: number;
  }>([
    { $match: { dateKey: { $gte: sinceKey, $lte: todayKey } } },
    {
      $group: {
        _id: { slug: "$medicationSlug", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const bySlug = new Map<
    string,
    { completed: number; skipped: number; missed: number }
  >();
  for (const row of medRows) {
    const cur =
      bySlug.get(row._id.slug) ?? { completed: 0, skipped: 0, missed: 0 };
    if (row._id.status === "completed") cur.completed += row.count;
    else if (row._id.status === "skipped") cur.skipped += row.count;
    else if (row._id.status === "missed") cur.missed += row.count;
    bySlug.set(row._id.slug, cur);
  }

  const perMedication = MEDICATIONS.map((med) => {
    const c = bySlug.get(med.slug) ?? { completed: 0, skipped: 0, missed: 0 };
    const resolved = c.completed + c.skipped + c.missed;
    return {
      slug: med.slug,
      name: med.name,
      emoji: med.emoji,
      color: med.color as MedicationColor,
      completed: c.completed,
      skipped: c.skipped,
      missed: c.missed,
      completionPct: resolved ? round((c.completed / resolved) * 100) : 0,
    };
  });

  const mostSkipped = [...perMedication]
    .filter((m) => m.skipped > 0)
    .sort((a, b) => b.skipped - a.skipped)[0];
  const mostMissed = [...perMedication]
    .filter((m) => m.missed > 0)
    .sort((a, b) => b.missed - a.missed)[0];

  // Average completion delay (minutes after scheduled time)
  const completedLogs = await DailyLog.find({
    dateKey: { $gte: sinceKey, $lte: todayKey },
    status: "completed",
    completedAt: { $ne: null },
  })
    .select("scheduledTime completedAt")
    .lean();

  let delaySum = 0;
  let delayCount = 0;
  for (const log of completedLogs) {
    if (!log.completedAt) continue;
    const completedMinutes = getMinutesOfDay(timezone, new Date(log.completedAt));
    const scheduledMinutes = timeToMinutes(log.scheduledTime);
    const delay = completedMinutes - scheduledMinutes;
    // Ignore obviously cross-midnight artefacts.
    if (delay > -720 && delay < 720) {
      delaySum += delay;
      delayCount += 1;
    }
  }
  const averageCompletionMinutes = delayCount
    ? round(delaySum / delayCount)
    : null;

  return {
    completionPct,
    weeklyAdherence,
    monthlyAdherence,
    longestStreak: computeLongestStreak(aggregates, sinceKey, todayKey),
    currentStreak: computeMedicationStreak(aggregates, todayKey),
    totalTaken,
    totalMissed,
    totalSkipped,
    perMedication,
    mostSkipped: mostSkipped
      ? { name: mostSkipped.name, emoji: mostSkipped.emoji, count: mostSkipped.skipped }
      : null,
    mostMissed: mostMissed
      ? { name: mostMissed.name, emoji: mostMissed.emoji, count: mostMissed.missed }
      : null,
    averageCompletionMinutes,
    rangeLabel: `Last ${RANGE_DAYS} days`,
  };
}
