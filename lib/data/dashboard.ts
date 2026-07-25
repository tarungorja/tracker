import { HEATMAP_DAYS } from "@/lib/constants";
import { addDaysToKey, minutesToLabel } from "@/lib/time";
import type { DoseView, MedicationView } from "@/models";
import {
  currentStreak,
  DayCompletion,
  getCompletionMap,
  getDosesForDay,
  getMedicationViews,
  nowContext,
} from "@/lib/data/shared";

export interface NextReminder {
  medicationName: string;
  scheduledTime: string;
  minutesUntil: number;
  isTomorrow: boolean;
}

export interface DashboardData {
  todayKey: string;
  nowMinutes: number;
  doses: DoseView[];
  totalToday: number;
  completedToday: number;
  remainingToday: number;
  progress: number; // 0-100
  currentStreak: number;
  nextReminder: NextReminder | null;
  medications: MedicationView[];
  heatmap: DayCompletion[];
}

function computeNextReminder(doses: DoseView[], nowMinutes: number): NextReminder | null {
  const pending = doses
    .filter((d) => !d.completed)
    .sort((a, b) => a.scheduledMinutes - b.scheduledMinutes);

  const upcoming = pending.find((d) => d.scheduledMinutes >= nowMinutes);
  if (upcoming) {
    return {
      medicationName: upcoming.medicationName,
      scheduledTime: upcoming.scheduledTime,
      minutesUntil: upcoming.scheduledMinutes - nowMinutes,
      isTomorrow: false,
    };
  }

  // Nothing left today — surface the earliest dose tomorrow.
  const earliest = [...doses].sort((a, b) => a.scheduledMinutes - b.scheduledMinutes)[0];
  if (!earliest) return null;
  return {
    medicationName: earliest.medicationName,
    scheduledTime: earliest.scheduledTime,
    minutesUntil: 24 * 60 - nowMinutes + earliest.scheduledMinutes,
    isTomorrow: true,
  };
}

export async function getDashboardData(now: Date = new Date()): Promise<DashboardData> {
  const { todayKey, nowMinutes } = nowContext(now);

  const [doses, medications, completionMap] = await Promise.all([
    getDosesForDay(todayKey),
    getMedicationViews(true),
    getCompletionMap(addDaysToKey(todayKey, -(HEATMAP_DAYS - 1)), todayKey),
  ]);

  const totalToday = doses.length;
  const completedToday = doses.filter((d) => d.completed).length;
  const remainingToday = totalToday - completedToday;
  const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Overlay today's live progress onto the heatmap's final cell.
  const today = completionMap.get(todayKey);
  if (today) {
    today.total = Math.max(today.total, totalToday);
    today.completed = completedToday;
    today.ratio = today.total > 0 ? today.completed / today.total : 0;
  }

  const isDayComplete = (key: string) => {
    const day = completionMap.get(key);
    return Boolean(day && day.total > 0 && day.completed >= day.total);
  };

  const heatmap = Array.from(completionMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    todayKey,
    nowMinutes,
    doses,
    totalToday,
    completedToday,
    remainingToday,
    progress,
    currentStreak: currentStreak(todayKey, isDayComplete, true),
    nextReminder: computeNextReminder(doses, nowMinutes),
    medications,
    heatmap,
  };
}

/** Human label for "in X minutes" / "in Xh Ym". */
export function untilLabel(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `in ${hours}h` : `in ${hours}h ${mins}m`;
}

export { minutesToLabel };
