import { connectToDatabase } from "@/lib/db";
import { DailyLog, MasturbationLog } from "@/lib/models";
import { TOTAL_DAILY_DOSES } from "@/lib/constants";
import { addDaysKey } from "@/lib/time";

export interface DayAgg {
  dateKey: string;
  total: number;
  completed: number;
  skipped: number;
  missed: number;
  pending: number;
}

/** Aggregate DailyLog rows by day within an inclusive `[since, until]` range. */
export async function getDailyAggregates(
  sinceKey: string,
  untilKey: string,
): Promise<Map<string, DayAgg>> {
  await connectToDatabase();
  const rows = await DailyLog.aggregate<{
    _id: string;
    total: number;
    completed: number;
    skipped: number;
    missed: number;
    pending: number;
  }>([
    { $match: { dateKey: { $gte: sinceKey, $lte: untilKey } } },
    {
      $group: {
        _id: "$dateKey",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        skipped: { $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] } },
        missed: { $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      },
    },
  ]);

  const map = new Map<string, DayAgg>();
  for (const row of rows) {
    map.set(row._id, {
      dateKey: row._id,
      total: row.total,
      completed: row.completed,
      skipped: row.skipped,
      missed: row.missed,
      pending: row.pending,
    });
  }
  return map;
}

/** A "perfect" day = every scheduled dose was completed. */
export function isPerfectDay(agg: DayAgg | undefined): boolean {
  return !!agg && agg.completed >= TOTAL_DAILY_DOSES;
}

/**
 * Consecutive perfect days ending at (or just before) today. Today is only
 * required to be perfect to be counted — an in-progress today does not break
 * the streak accumulated from previous days.
 */
export function computeMedicationStreak(
  aggregates: Map<string, DayAgg>,
  todayKey: string,
): number {
  let streak = 0;
  let cursor = todayKey;

  if (isPerfectDay(aggregates.get(todayKey))) {
    streak += 1;
  }
  cursor = addDaysKey(todayKey, -1);

  for (let i = 0; i < 730; i++) {
    if (isPerfectDay(aggregates.get(cursor))) {
      streak += 1;
      cursor = addDaysKey(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

export interface MasturbationDayCount {
  dateKey: string;
  count: number;
}

/** Per-day masturbation counts within an inclusive range. */
export async function getMasturbationCounts(
  sinceKey: string,
  untilKey: string,
): Promise<Map<string, number>> {
  await connectToDatabase();
  const rows = await MasturbationLog.find({
    dateKey: { $gte: sinceKey, $lte: untilKey },
  })
    .select("dateKey count")
    .lean();
  const map = new Map<string, number>();
  for (const row of rows) map.set(row.dateKey, row.count ?? 0);
  return map;
}
