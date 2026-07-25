import { addDaysToKey, dateKeyRange, parseScheduleToMinutes } from "@/lib/time";
import { WELLNESS_LOG_KEY } from "@/lib/constants";
import type { MedicationView } from "@/models";
import { DailyLog } from "@/models";
import { connectToDatabase } from "@/lib/db";
import {
  getDosesForDay,
  getMedicationViews,
  isMedicationDueOn,
  nowContext,
} from "@/lib/data/shared";

const HISTORY_DAYS = 14;

export interface MedHistoryDay {
  date: string;
  total: number;
  completed: number;
  ratio: number;
}

export interface MedTodayDose {
  time: string;
  minutes: number;
  completed: boolean;
}

export interface MedicationWithHistory extends MedicationView {
  todayDoses: MedTodayDose[];
  completedToday: number;
  totalToday: number;
  history: MedHistoryDay[];
}

export interface MedicationsPageData {
  todayKey: string;
  nowMinutes: number;
  medications: MedicationWithHistory[];
}

export async function getMedicationsPageData(
  now: Date = new Date(),
): Promise<MedicationsPageData> {
  await connectToDatabase();
  const { todayKey, nowMinutes } = nowContext(now);
  const startKey = addDaysToKey(todayKey, -(HISTORY_DAYS - 1));

  const [meds, todayDoses, historyRows] = await Promise.all([
    getMedicationViews(false),
    getDosesForDay(todayKey),
    DailyLog.find({
      date: { $gte: startKey, $lte: todayKey },
      medicationName: { $ne: WELLNESS_LOG_KEY },
    }).lean(),
  ]);

  // Index history: medName -> date -> {total, completed}
  const historyIndex = new Map<string, Map<string, { total: number; completed: number }>>();
  for (const row of historyRows) {
    const perMed = historyIndex.get(row.medicationName) ?? new Map();
    const day = perMed.get(row.date) ?? { total: 0, completed: 0 };
    day.total += 1;
    if (row.completed) day.completed += 1;
    perMed.set(row.date, day);
    historyIndex.set(row.medicationName, perMed);
  }

  const dayKeys = dateKeyRange(startKey, todayKey);

  const medications: MedicationWithHistory[] = meds.map((med) => {
    const dueToday = isMedicationDueOn(med, todayKey);
    const doses: MedTodayDose[] = dueToday
      ? med.scheduleTimes.map((time) => {
          const match = todayDoses.find(
            (d) => d.medicationName === med.name && d.scheduledTime === time,
          );
          return {
            time,
            minutes: parseScheduleToMinutes(time) ?? 0,
            completed: match?.completed ?? false,
          };
        })
      : [];

    const perMed = historyIndex.get(med.name);
    const history: MedHistoryDay[] = dayKeys.map((date) => {
      // Only days the medication is actually scheduled on count toward history.
      const scheduledTotal = isMedicationDueOn(med, date) ? med.scheduleTimes.length : 0;
      const logged = perMed?.get(date);
      const total = date === todayKey ? scheduledTotal : logged?.total ?? scheduledTotal;
      const completed = logged?.completed ?? 0;
      return {
        date,
        total,
        completed,
        ratio: total > 0 ? completed / total : 0,
      };
    });

    return {
      ...med,
      todayDoses: doses,
      completedToday: doses.filter((d) => d.completed).length,
      totalToday: doses.length,
      history,
    };
  });

  return { todayKey, nowMinutes, medications };
}
