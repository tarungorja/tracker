import { connectToDatabase } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import {
  ALL_DAYS,
  istDateKey,
  istMinutesOfDay,
  minutesToLabel,
  parseScheduleToMinutes,
  weekdayOfKey,
} from "@/lib/time";
import { DailyLog, Medication, PushToken, ReminderSent } from "@/models";

/**
 * How far back a run still counts a dose as "due". External crons are rarely exact,
 * so a run slightly after the scheduled minute (or one missed run) still notifies.
 * Duplicates are prevented by ReminderSent, so a wide window is safe.
 */
const LOOKBACK_MINUTES = 5;

export interface ReminderRunResult {
  usersChecked: number;
  dosesDue: number;
  notificationsSent: number;
  failures: number;
}

/** Distinct (IST date, minute-of-day) pairs covering the last LOOKBACK_MINUTES minutes. */
function recentMoments(now: Date): { dateKey: string; minutes: number }[] {
  const moments: { dateKey: string; minutes: number }[] = [];
  for (let k = 0; k < LOOKBACK_MINUTES; k++) {
    const t = new Date(now.getTime() - k * 60_000);
    moments.push({ dateKey: istDateKey(t), minutes: istMinutesOfDay(t) });
  }
  return moments;
}

export async function sendDueReminders(now: Date = new Date()): Promise<ReminderRunResult> {
  await connectToDatabase();

  const userIds = await PushToken.distinct("userId");
  const result: ReminderRunResult = {
    usersChecked: userIds.length,
    dosesDue: 0,
    notificationsSent: 0,
    failures: 0,
  };
  if (userIds.length === 0) return result;

  const meds = await Medication.find({ userId: { $in: userIds }, enabled: true }).lean();
  const moments = recentMoments(now);

  // userId -> "date|time" -> medication names newly claimed for this run
  const toNotify = new Map<string, Map<string, { dateKey: string; time: string; names: string[] }>>();

  for (const med of meds) {
    const userId = String(med.userId);
    for (const label of med.scheduleTimes) {
      const minutes = parseScheduleToMinutes(label);
      if (minutes === null) continue;

      for (const moment of moments) {
        if (moment.minutes !== minutes) continue;
        // Medications saved before weekday support have no days stored: treat as every day.
        const days: readonly number[] = med.daysOfWeek?.length ? med.daysOfWeek : ALL_DAYS;
        if (!days.includes(weekdayOfKey(moment.dateKey))) continue;
        result.dosesDue += 1;

        const time = minutesToLabel(minutes);

        // Already taken? Then there's nothing to remind about.
        const done = await DailyLog.exists({
          userId,
          date: moment.dateKey,
          medicationName: med.name,
          scheduledTime: time,
          completed: true,
        });
        if (done) continue;

        // Claim this dose; a duplicate-key error means it was already reminded.
        try {
          await ReminderSent.create({
            userId,
            date: moment.dateKey,
            medicationName: med.name,
            scheduledTime: time,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes("duplicate key")) continue;
          throw error;
        }

        const perUser = toNotify.get(userId) ?? new Map();
        const key = `${moment.dateKey}|${time}`;
        const slot = perUser.get(key) ?? { dateKey: moment.dateKey, time, names: [] };
        slot.names.push(med.name);
        perUser.set(key, slot);
        toNotify.set(userId, perUser);
      }
    }
  }

  for (const [userId, slots] of toNotify) {
    for (const slot of slots.values()) {
      let delivered = false;
      try {
        const sent = await sendPushToUser(userId, {
          title: `Time for your ${slot.time} medication`,
          body: slot.names.join(", "),
          url: "/today",
          tag: `dose-${slot.dateKey}-${slot.time}`,
        });
        result.notificationsSent += sent.sent;
        result.failures += sent.failed;
        // No registered device at all (tokens pruned) counts as nothing to retry.
        delivered = sent.sent > 0 || sent.failed === 0;
      } catch (error) {
        console.error("Reminder push failed", userId, error);
        result.failures += 1;
      }

      if (!delivered) {
        // Release the claim so the next run inside the lookback window retries.
        await ReminderSent.deleteMany({
          userId,
          date: slot.dateKey,
          scheduledTime: slot.time,
          medicationName: { $in: slot.names },
        });
      }
    }
  }

  return result;
}
