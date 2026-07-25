import { parseScheduleToMinutes } from "@/lib/time";
import type { DoseStatus, DoseView } from "@/models";
import { doseStatus, getDosesForDay, nowContext } from "@/lib/data/shared";

export type TimelineDose = DoseView & { status: DoseStatus };

export interface TimelineSlot {
  time: string;
  minutes: number;
  doses: TimelineDose[];
}

export interface TodayData {
  todayKey: string;
  nowMinutes: number;
  slots: TimelineSlot[];
  total: number;
  completed: number;
}

export async function getTodayData(now: Date = new Date()): Promise<TodayData> {
  const { todayKey, nowMinutes } = nowContext(now);
  const doses = await getDosesForDay(todayKey);

  const byTime = new Map<string, TimelineSlot>();
  for (const dose of doses) {
    const status = doseStatus(dose, nowMinutes, true);
    const slot = byTime.get(dose.scheduledTime);
    const entry: TimelineDose = { ...dose, status };
    if (slot) {
      slot.doses.push(entry);
    } else {
      byTime.set(dose.scheduledTime, {
        time: dose.scheduledTime,
        minutes: parseScheduleToMinutes(dose.scheduledTime) ?? 0,
        doses: [entry],
      });
    }
  }

  const slots = Array.from(byTime.values()).sort((a, b) => a.minutes - b.minutes);

  return {
    todayKey,
    nowMinutes,
    slots,
    total: doses.length,
    completed: doses.filter((d) => d.completed).length,
  };
}
