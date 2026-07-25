import { connectToDatabase } from "@/lib/db";
import { MasturbationLog, DailyLog } from "@/lib/models";
import { getSettings } from "@/lib/data/settings";
import { getMasturbationCounts } from "@/lib/data/aggregate";
import {
  getDateKey,
  addDaysKey,
  rangeKeys,
  dateKeyToDate,
} from "@/lib/time";
import { round } from "@/lib/utils";
import type { MasturbationData } from "@/types";

const HEATMAP_DAYS = 140; // 20 weeks

function shortDay(dateKey: string): string {
  return dateKeyToDate(dateKey).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function getMasturbationData(): Promise<MasturbationData> {
  await connectToDatabase();
  const settings = await getSettings();
  const timezone = settings.timezone;
  const todayKey = getDateKey(timezone);

  // Recent per-day counts (covers heatmap, weekly, daily, streak, month avg).
  const recentSince = addDaysKey(todayKey, -(HEATMAP_DAYS - 1));
  const recent = await getMasturbationCounts(recentSince, todayKey);
  const todayCount = recent.get(todayKey) ?? 0;

  // All-time stats.
  const [allTime] = await MasturbationLog.aggregate<{
    total: number;
    highest: number;
    earliest: string;
  }>([
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        highest: { $max: "$count" },
        earliest: { $min: "$dateKey" },
      },
    },
  ]);
  const totalAllTime = allTime?.total ?? 0;
  const highestDaily = allTime?.highest ?? 0;

  // Earliest tracked day (masturbation or medication) bounds the "clean streak".
  const [earliestLog] = await DailyLog.find({})
    .sort({ dateKey: 1 })
    .select("dateKey")
    .limit(1)
    .lean();
  const trackingStart = [allTime?.earliest, earliestLog?.dateKey]
    .filter(Boolean)
    .sort()[0] as string | undefined;

  // Current streak of days without (ending today), bounded by tracking start.
  let currentStreak = 0;
  if (trackingStart) {
    let cursor = todayKey;
    for (let i = 0; i < 3650 && cursor >= trackingStart; i++) {
      // Days inside the recent window are already cached; older days (rare,
      // only for very long streaks) fall back to a single-doc lookup.
      const count =
        cursor >= recentSince
          ? recent.get(cursor) ?? 0
          : await lookupCount(cursor);
      if (count > 0) break;
      currentStreak += 1;
      cursor = addDaysKey(cursor, -1);
    }
  }

  // Monthly average = mean daily count across the current month so far.
  const monthPrefix = todayKey.slice(0, 7);
  const monthKeys = rangeKeys(`${monthPrefix}-01`, todayKey);
  const monthSum = monthKeys.reduce((sum, k) => sum + (recent.get(k) ?? 0), 0);
  const monthlyAverage = monthKeys.length
    ? round(monthSum / monthKeys.length, 2)
    : 0;

  // Daily (last 14 days).
  const daily = rangeKeys(addDaysKey(todayKey, -13), todayKey).map((k) => ({
    dateKey: k,
    count: recent.get(k) ?? 0,
  }));

  // Weekly (last 8 weeks, chronological).
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const idx = 7 - i;
    const start = addDaysKey(todayKey, -(idx * 7 + 6));
    const end = addDaysKey(todayKey, -idx * 7);
    const count = rangeKeys(start, end).reduce(
      (sum, k) => sum + (recent.get(k) ?? 0),
      0,
    );
    return { label: shortDay(start), count };
  });

  // Heatmap (last HEATMAP_DAYS days).
  const heatmap = rangeKeys(recentSince, todayKey).map((k) => ({
    dateKey: k,
    count: recent.get(k) ?? 0,
  }));

  // Monthly totals (last 6 months) via DB aggregate.
  const monthlyRows = await MasturbationLog.aggregate<{
    _id: string;
    count: number;
  }>([
    {
      $group: {
        _id: { $substrBytes: ["$dateKey", 0, 7] },
        count: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const monthly = monthlyRows.slice(-6).map((row) => ({
    label: dateKeyToDate(`${row._id}-15`).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }),
    count: row.count,
  }));

  // Yearly totals.
  const yearlyRows = await MasturbationLog.aggregate<{
    _id: string;
    count: number;
  }>([
    {
      $group: {
        _id: { $substrBytes: ["$dateKey", 0, 4] },
        count: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const yearly = yearlyRows.slice(-4).map((row) => ({
    label: row._id,
    count: row.count,
  }));

  const todayDoc = await MasturbationLog.findOne({ dateKey: todayKey })
    .select("notes")
    .lean();

  return {
    todayCount,
    timezone,
    currentStreak,
    highestDaily,
    monthlyAverage,
    totalAllTime,
    daily,
    weekly,
    monthly,
    yearly,
    heatmap,
    todayNotes: todayDoc?.notes ?? "",
  };
}

/** Fallback single-day lookup for streak days older than the recent window. */
async function lookupCount(dateKey: string): Promise<number> {
  const doc = await MasturbationLog.findOne({ dateKey })
    .select("count")
    .lean();
  return doc?.count ?? 0;
}
