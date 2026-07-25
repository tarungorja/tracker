import { connectToDatabase } from "@/lib/db";
import {
  addDaysToKey,
  dateKeyRange,
  daysBetweenKeys,
  shortDateLabel,
} from "@/lib/time";
import { WELLNESS_LOG_KEY } from "@/lib/constants";
import { DailyLog } from "@/models";
import { nowContext } from "@/lib/data/shared";

const YEAR_DAYS = 365;
const CALENDAR_DAYS = 119; // 17 weeks
const WEEKLY_AVG_WINDOW = 84; // 12 weeks

export interface CountPoint {
  date: string;
  label: string;
  count: number;
}

export interface HistoryEntry {
  date: string;
  label: string;
  count: number;
  notes: string;
}

export interface WellnessData {
  todayKey: string;
  todayCount: number;
  todayNotes: string;
  weekly: CountPoint[];
  monthly: CountPoint[];
  calendar: CountPoint[];
  history: HistoryEntry[];
  totalThisYear: number;
  averagePerWeek: number;
  longestCleanStreak: number;
  currentCleanStreak: number;
  totalTracked: number;
}

export async function getWellnessData(now: Date = new Date()): Promise<WellnessData> {
  await connectToDatabase();
  const { todayKey } = nowContext(now);
  const rangeStart = addDaysToKey(todayKey, -(YEAR_DAYS - 1));

  // Wellness is stored as one DailyLog row per day keyed by WELLNESS_LOG_KEY.
  const logs = await DailyLog.find({
    medicationName: WELLNESS_LOG_KEY,
    date: { $gte: rangeStart, $lte: todayKey },
  })
    .sort({ date: 1 })
    .lean();

  const countMap = new Map<string, number>();
  const notesMap = new Map<string, string>();
  for (const log of logs) {
    countMap.set(log.date, log.count ?? 0);
    if (log.notes) notesMap.set(log.date, log.notes);
  }

  const point = (date: string): CountPoint => ({
    date,
    label: shortDateLabel(date),
    count: countMap.get(date) ?? 0,
  });

  const weekly = dateKeyRange(addDaysToKey(todayKey, -6), todayKey).map(point);
  const monthly = dateKeyRange(addDaysToKey(todayKey, -29), todayKey).map(point);
  const calendar = dateKeyRange(addDaysToKey(todayKey, -(CALENDAR_DAYS - 1)), todayKey).map(point);

  const history: HistoryEntry[] = logs
    .filter((log) => (log.count ?? 0) > 0 || Boolean(log.notes))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
    .map((log) => ({
      date: log.date,
      label: shortDateLabel(log.date),
      count: log.count ?? 0,
      notes: log.notes ?? "",
    }));

  const yearStart = `${todayKey.slice(0, 4)}-01-01`;
  let totalThisYear = 0;
  let totalTracked = 0;
  for (const [date, count] of countMap) {
    totalTracked += count;
    if (date >= yearStart) totalThisYear += count;
  }

  // Weekly average over the last 12 weeks.
  let windowTotal = 0;
  for (const date of dateKeyRange(addDaysToKey(todayKey, -(WEEKLY_AVG_WINDOW - 1)), todayKey)) {
    windowTotal += countMap.get(date) ?? 0;
  }
  const averagePerWeek = Math.round((windowTotal / (WEEKLY_AVG_WINDOW / 7)) * 10) / 10;

  // Streaks are measured only within the tracked window (earliest log → today)
  // so a brand-new tracker doesn't report an infinite "clean" streak.
  const earliestLogged = logs.find((l) => (l.count ?? 0) > 0)?.date ?? todayKey;
  const isClean = (key: string) => (countMap.get(key) ?? 0) === 0;

  // Current clean streak: consecutive zero-count days ending today.
  let currentCleanStreak = 0;
  let cursor = todayKey;
  const floor = earliestLogged <= todayKey ? earliestLogged : todayKey;
  while (cursor >= floor && isClean(cursor)) {
    currentCleanStreak += 1;
    cursor = addDaysToKey(cursor, -1);
  }

  // Longest clean streak across the tracked window.
  let longestCleanStreak = 0;
  let run = 0;
  const trackingKeys = dateKeyRange(earliestLogged, todayKey);
  for (const key of trackingKeys) {
    if (isClean(key)) {
      run += 1;
      longestCleanStreak = Math.max(longestCleanStreak, run);
    } else {
      run = 0;
    }
  }
  // If nothing has ever been logged as >0, the whole window is one clean streak.
  if (logs.every((l) => (l.count ?? 0) === 0)) {
    const span = daysBetweenKeys(floor, todayKey) + 1;
    longestCleanStreak = Math.max(longestCleanStreak, span > 0 ? span : 1);
    currentCleanStreak = longestCleanStreak;
  }

  return {
    todayKey,
    todayCount: countMap.get(todayKey) ?? 0,
    todayNotes: notesMap.get(todayKey) ?? "",
    weekly,
    monthly,
    calendar,
    history,
    totalThisYear,
    averagePerWeek,
    longestCleanStreak,
    currentCleanStreak,
    totalTracked,
  };
}
