import { getSettings } from "@/lib/data/settings";
import { reconcileMissed, getDayDoses } from "@/lib/data/logs";
import { getDailyAggregates, getMasturbationCounts } from "@/lib/data/aggregate";
import { getDateKey, formatMonthLabel, pad } from "@/lib/time";
import type { CalendarMonth, DayStatus, TimelineDose } from "@/types";

function toneFor(
  agg:
    | { total: number; completed: number; skipped: number; missed: number; pending: number }
    | undefined,
): DayStatus["tone"] {
  if (!agg || agg.total === 0) return "empty";
  if (agg.missed > 0) return "missed";
  if (agg.skipped > 0) return "skipped";
  if (agg.pending > 0) return "partial";
  return "completed";
}

/** Build the day grid + status tones for a month (`YYYY-MM`). */
export async function getMonthData(monthKey?: string): Promise<CalendarMonth> {
  const settings = await getSettings();
  const timezone = settings.timezone;
  await reconcileMissed(timezone);

  const todayKey = getDateKey(timezone);
  const resolvedMonth = monthKey ?? todayKey.slice(0, 7);
  const [year, month] = resolvedMonth.split("-").map((v) => parseInt(v, 10));
  const daysInMonth = new Date(year, month, 0).getDate();

  const firstKey = `${resolvedMonth}-01`;
  const lastKey = `${resolvedMonth}-${pad(daysInMonth)}`;

  const aggregates = await getDailyAggregates(firstKey, lastKey);
  const masturbation = await getMasturbationCounts(firstKey, lastKey);

  const days: DayStatus[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${resolvedMonth}-${pad(d)}`;
    const agg = aggregates.get(dateKey);
    days.push({
      dateKey,
      total: agg?.total ?? 0,
      completed: agg?.completed ?? 0,
      skipped: agg?.skipped ?? 0,
      missed: agg?.missed ?? 0,
      pending: agg?.pending ?? 0,
      hasData: !!agg && agg.total > 0,
      tone: toneFor(agg),
      masturbationCount: masturbation.get(dateKey) ?? 0,
    });
  }

  return {
    monthKey: resolvedMonth,
    label: formatMonthLabel(resolvedMonth),
    days,
    timezone,
  };
}

export interface DayHistory {
  dateKey: string;
  doses: TimelineDose[];
  masturbationCount: number;
}

/** Full per-dose history + masturbation count for a single day. */
export async function getDayHistory(dateKey: string): Promise<DayHistory> {
  const doses = await getDayDoses(dateKey);
  const masturbation = await getMasturbationCounts(dateKey, dateKey);
  return {
    dateKey,
    doses,
    masturbationCount: masturbation.get(dateKey) ?? 0,
  };
}
