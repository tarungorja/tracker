import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import {
  ALL_DAYS,
  addDaysToKey,
  dateKeyRange,
  istDateKey,
  istMinutesOfDay,
  parseScheduleToMinutes,
  weekdayOfKey,
} from "@/lib/time";
import { WELLNESS_LOG_KEY } from "@/lib/constants";
import type { DoseStatus, DoseView, MedicationView } from "@/models";
import { DailyLog, Medication } from "@/models";

export interface DayCompletion {
  date: string;
  total: number;
  completed: number;
  ratio: number;
}

export async function getMedicationViews(
  userId: string,
  onlyEnabled = false,
): Promise<MedicationView[]> {
  await connectToDatabase();
  const filter = onlyEnabled ? { userId, enabled: true } : { userId };
  const meds = await Medication.find(filter).sort({ name: 1 }).lean();
  return meds.map((med) => {
    return {
      id: String(med._id),
      name: med.name,
      description: med.description ?? "",
      instructions: med.instructions ?? "",
      scheduleTimes: (med.scheduleTimes ?? []).slice().sort((a, b) => {
        return (parseScheduleToMinutes(a) ?? 0) - (parseScheduleToMinutes(b) ?? 0);
      }),
      daysOfWeek: normalizeDays(med.daysOfWeek),
      enabled: Boolean(med.enabled),
    };
  });
}

function normalizeDays(days: number[] | undefined): number[] {
  const valid = Array.from(new Set(days ?? [])).filter((d) => d >= 0 && d <= 6);
  return valid.length > 0 ? valid.sort((a, b) => a - b) : [...ALL_DAYS];
}

export function isMedicationDueOn(
  med: Pick<MedicationView, "daysOfWeek">,
  dateKey: string,
): boolean {
  return med.daysOfWeek.includes(weekdayOfKey(dateKey));
}

export async function getDosesForDay(userId: string, dateKey: string): Promise<DoseView[]> {
  await connectToDatabase();
  const meds = await getMedicationViews(userId, true);
  const logs = await DailyLog.find({
    userId,
    date: dateKey,
    medicationName: { $ne: WELLNESS_LOG_KEY },
  }).lean();

  const logMap = new Map<string, { completed: boolean; completedAt: Date | null }>();
  for (const log of logs) {
    logMap.set(`${log.medicationName}|${log.scheduledTime}`, {
      completed: Boolean(log.completed),
      completedAt: log.completedAt ?? null,
    });
  }

  const doses: DoseView[] = [];
  for (const med of meds) {
    if (!isMedicationDueOn(med, dateKey)) continue;
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

export function doseStatus(
  dose: Pick<DoseView, "completed" | "scheduledMinutes">,
  nowMinutes: number,
  isToday: boolean,
): DoseStatus {
  if (dose.completed) return "completed";
  if (!isToday) return "missed";
  return dose.scheduledMinutes > nowMinutes ? "upcoming" : "missed";
}

export async function getCompletionMap(
  userId: string,
  startKey: string,
  endKey: string,
): Promise<Map<string, DayCompletion>> {
  await connectToDatabase();
  const rows = await DailyLog.aggregate<{
    _id: string;
    total: number;
    completed: number;
  }>([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: { $gte: startKey, $lte: endKey },
        medicationName: { $ne: WELLNESS_LOG_KEY },
      },
    },
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

export function nowContext(now: Date = new Date()) {
  return {
    now,
    todayKey: istDateKey(now),
    nowMinutes: istMinutesOfDay(now),
  };
}
