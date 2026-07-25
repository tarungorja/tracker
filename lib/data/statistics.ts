import { connectToDatabase } from "@/lib/db";
import { addDaysToKey } from "@/lib/time";
import { WELLNESS_LOG_KEY } from "@/lib/constants";
import { DailyLog } from "@/models";
import {
  currentStreak,
  DayCompletion,
  getCompletionMap,
  longestStreak,
  nowContext,
} from "@/lib/data/shared";

const STATS_DAYS = 120;

export interface MedicationStat {
  name: string;
  total: number;
  completed: number;
  percent: number;
}

export interface StatisticsData {
  todayKey: string;
  overallPercent: number;
  overallCompleted: number;
  overallTotal: number;
  monthPercent: number;
  monthCompleted: number;
  monthTotal: number;
  currentStreak: number;
  longestStreak: number;
  missedReminders: number;
  heatmap: DayCompletion[];
  medicationStats: MedicationStat[];
}

export async function getStatisticsData(now: Date = new Date()): Promise<StatisticsData> {
  await connectToDatabase();
  const { todayKey } = nowContext(now);
  const startKey = addDaysToKey(todayKey, -(STATS_DAYS - 1));
  const monthStartKey = `${todayKey.slice(0, 7)}-01`;

  const [completionMap, medRows, missedReminders] = await Promise.all([
    getCompletionMap(startKey, todayKey),
    DailyLog.aggregate<{ _id: string; total: number; completed: number }>([
      {
        $match: {
          date: { $gte: startKey, $lte: todayKey },
          medicationName: { $ne: WELLNESS_LOG_KEY },
        },
      },
      {
        $group: {
          _id: "$medicationName",
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
        },
      },
    ]),
    DailyLog.countDocuments({
      completed: false,
      date: { $lt: todayKey },
      medicationName: { $ne: WELLNESS_LOG_KEY },
    }),
  ]);

  const days = Array.from(completionMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  let overallCompleted = 0;
  let overallTotal = 0;
  let monthCompleted = 0;
  let monthTotal = 0;
  for (const day of days) {
    overallCompleted += day.completed;
    overallTotal += day.total;
    if (day.date >= monthStartKey) {
      monthCompleted += day.completed;
      monthTotal += day.total;
    }
  }

  const isDayComplete = (key: string) => {
    const day = completionMap.get(key);
    return Boolean(day && day.total > 0 && day.completed >= day.total);
  };

  const orderedKeys = days.map((d) => d.date);

  const medicationStats: MedicationStat[] = medRows
    .map((row) => ({
      name: row._id,
      total: row.total,
      completed: row.completed,
      percent: row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));

  return {
    todayKey,
    overallPercent: overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0,
    overallCompleted,
    overallTotal,
    monthPercent: monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0,
    monthCompleted,
    monthTotal,
    currentStreak: currentStreak(todayKey, isDayComplete, true),
    longestStreak: longestStreak(orderedKeys, isDayComplete),
    missedReminders,
    heatmap: days,
    medicationStats,
  };
}
