import { connectToDatabase } from "@/lib/db";
import {
  addDaysToKey,
  dateKeyRange,
  istDateKey,
  istMinutesOfDay,
  parseScheduleToMinutes,
} from "@/lib/time";
import { ensureSeeded } from "@/lib/seed";
import type { DoseStatus, DoseView, MedicationView } from "@/models";
import { DailyLog, Medication } from "@/models";

/** Per-day adherence figures. */
export interface DayCompletion {
  date: string;
  total: number;
  completed: number;
  ratio: number; // 0-1
}

/** Fetch enabled medications as plain serialisable views. */
export async function getMedicationViews(onlyEnabled = false): Promise<MedicationView[]> {
  await connectToDatabase();
  await ensureSeeded();
  const filter = onlyEnabled ? { enabled: true } : {};
  const meds = await Medication.find(filter).sort({ name: 1 }).lean();
  return meds.map((med) => ({
    id: String(med._id),
    name: med.name,
    description: med.description ?? "",
    instructions: med.instructions ?? "",
    scheduleTimes: (med.scheduleTimes ?? []).slice().sort((a, b) => {
      return (parseScheduleToMinutes(a) ?? 0) - (parseScheduleToMinutes(b) ?? 0);
    }),
    enabled: Boolean(med.enabled),
  }));
}

/**
 * Compute every dose scheduled for a given day, merged with its completion
 * state from DailyLog. The medication schedule is the source of truth, so the
 * full set of doses is always known even before any log rows exist.
 */
export async function getDosesForDay(dateKey: string): Promise<DoseView[]> {
  await connectToDatabase();
  const meds = await getMedicationViews(true);
  const logs = await DailyLog.find({ date: dateKey }).lean();

  const logMap = new Map<string, { completed: boolean; completedAt: Date | null }>();
  for (const log of logs) {
    logMap.set(`${log.medicationName}|${log.scheduledTime}`, {
      completed: Boolean(log.completed),
      completedAt: log.completedAt ?? null,
    });
  }

  const doses: DoseView[] = [];
  for (const med of meds) {
    for (const time of med.scheduleTimes) {
      const minutes = parseScheduleToMinutes(time) ?? 0;
      const log = logMap.get(`${med.name}|${time}`);
      doses.push({
        medicationName: med.name,
        scheduledTime: time,
        scheduledMinutes: minutes,
        completed: log?.completed ?? false,
        completedAt: log?.completedAt ? log.completedAt.toISOString() : null,
      });
    }
  }

  return doses.sort((a, b) => a.scheduledMinutes - b.scheduledMinutes);
}

/** Derive a UI status for a dose relative to "now" (only meaningful for today). */
export function doseStatus(
  dose: Pick<DoseView, "completed" | "scheduledMinutes">,
  nowMinutes: number,
  isToday: boolean,
): DoseStatus {
  if (dose.completed) return "completed";
  if (!isToday) return "missed";
  return dose.scheduledMinutes > nowMinutes ? "upcoming" : "missed";
}

/**
 * Aggregate DailyLog rows across a date range into per-day adherence.
 * Days with no rows are returned with total 0.
 */
export async function getCompletionMap(
  startKey: string,
  endKey: string,
): Promise<Map<string, DayCompletion>> {
  await connectToDatabase();
  const rows = await DailyLog.aggregate<{
    _id: string;
    total: number;
    completed: number;
  }>([
    { $match: { date: { $gte: startKey, $lte: endKey } } },
    {
      $group: {
        _id: "$date",
        total: { $sum: 1 },
        completed: { $sum: { $cond: ["$completed", 1, 0] } },
      },
    },
  ]);

  const map = new Map<string, DayCompletion>();
  for (const key of dateKeyRange(startKey, endKey)) {
    map.set(key, { date: key, total: 0, completed: 0, ratio: 0 });
  }
  for (const row of rows) {
    const total = row.total;
    const completed = row.completed;
    map.set(row._id, {
      date: row._id,
      total,
      completed,
      ratio: total > 0 ? completed / total : 0,
    });
  }
  return map;
}

/** Longest run of consecutive success days in an ascending key list. */
export function longestStreak(
  orderedKeys: string[],
  isSuccess: (key: string) => boolean,
): number {
  let best = 0;
  let run = 0;
  for (const key of orderedKeys) {
    if (isSuccess(key)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

/**
 * Consecutive success days ending at `todayKey`. When `graceToday` is true and
 * today is not yet a success, today is treated as "in progress" (skipped, not
 * counted as a break) so an unfinished day doesn't zero the streak.
 */
export function currentStreak(
  todayKey: string,
  isSuccess: (key: string) => boolean,
  graceToday = true,
): number {
  let cursor = todayKey;
  let streak = 0;

  if (graceToday && !isSuccess(cursor)) {
    cursor = addDaysToKey(cursor, -1);
  }

  for (let i = 0; i < 4000; i++) {
    if (!isSuccess(cursor)) break;
    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

/** Convenience: current IST context shared by data helpers. */
export function nowContext(now: Date = new Date()) {
  return {
    now,
    todayKey: istDateKey(now),
    nowMinutes: istMinutesOfDay(now),
  };
}
