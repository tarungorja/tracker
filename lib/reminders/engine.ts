import { connectToDatabase } from "@/lib/db";
import { REMINDER_WINDOW_MINUTES } from "@/lib/constants";
import { getAppUrl } from "@/lib/env";
import { REMINDER_SUBJECT, sendEmail } from "@/lib/email/client";
import { renderReminderEmail, renderReminderText } from "@/lib/email/template";
import { signDose } from "@/lib/token";
import {
  istClockLabel,
  istDateKey,
  istMinutesOfDay,
  parseScheduleToMinutes,
} from "@/lib/time";
import { env } from "@/lib/env";
import { DailyLog, Medication, ReminderHistory } from "@/models";

export interface DueReminder {
  medicationName: string;
  instructions: string;
  scheduledTime: string;
  scheduledMinutes: number;
}

export interface ReminderRunResult {
  ranAt: string;
  nowMinutes: number;
  windowMinutes: number;
  due: number;
  sent: number;
  skippedDuplicate: number;
  failed: number;
  details: Array<{
    medicationName: string;
    scheduledTime: string;
    status: "sent" | "duplicate" | "failed";
    error?: string;
  }>;
}

/** Find every dose whose scheduled time falls within [now, now + window). */
export async function findDueReminders(now: Date = new Date()): Promise<DueReminder[]> {
  await connectToDatabase();
  const nowMinutes = istMinutesOfDay(now);
  const windowEnd = nowMinutes + REMINDER_WINDOW_MINUTES;

  const meds = await Medication.find({ enabled: true }).lean();
  const due: DueReminder[] = [];

  for (const med of meds) {
    for (const label of med.scheduleTimes ?? []) {
      const minutes = parseScheduleToMinutes(label);
      if (minutes === null) continue;
      // Due if the scheduled minute is at or after "now" but before the window
      // end. This fires the reminder in the 5-minute run that precedes the dose.
      if (minutes >= nowMinutes && minutes < windowEnd) {
        due.push({
          medicationName: med.name,
          instructions: med.instructions ?? "",
          scheduledTime: label,
          scheduledMinutes: minutes,
        });
      }
    }
  }

  return due;
}

/**
 * Run the full reminder cycle: find due doses, send emails, record history and
 * prevent duplicates. Designed to be called from the cron route handler.
 */
export async function runReminderCycle(now: Date = new Date()): Promise<ReminderRunResult> {
  await connectToDatabase();

  const dateKey = istDateKey(now);
  const nowMinutes = istMinutesOfDay(now);
  const currentTime = istClockLabel(now);
  const appUrl = getAppUrl();
  const recipient = env.NOTIFICATION_EMAIL;

  const due = await findDueReminders(now);

  const result: ReminderRunResult = {
    ranAt: now.toISOString(),
    nowMinutes,
    windowMinutes: REMINDER_WINDOW_MINUTES,
    due: due.length,
    sent: 0,
    skippedDuplicate: 0,
    failed: 0,
    details: [],
  };

  for (const reminder of due) {
    const key = {
      date: dateKey,
      medicationName: reminder.medicationName,
      scheduledTime: reminder.scheduledTime,
    };

    // Atomically claim this dose: insert-if-absent. If the upsert matched an
    // existing row instead of inserting, we already handled it in a prior run
    // -> skip, guaranteeing no duplicate emails.
    const claim = await ReminderHistory.updateOne(
      key,
      { $setOnInsert: { ...key, emailSent: false } },
      { upsert: true },
    );

    const alreadyExisted = claim.upsertedCount === 0;
    if (alreadyExisted) {
      result.skippedDuplicate += 1;
      result.details.push({
        medicationName: reminder.medicationName,
        scheduledTime: reminder.scheduledTime,
        status: "duplicate",
      });
      continue;
    }

    // Ensure a DailyLog row exists for this dose so the UI can track it.
    await DailyLog.updateOne(
      key,
      { $setOnInsert: { ...key, completed: false, completedAt: null, notes: "" } },
      { upsert: true },
    );

    const token = signDose(key);
    const completeUrl =
      `${appUrl}/api/complete?d=${encodeURIComponent(dateKey)}` +
      `&m=${encodeURIComponent(reminder.medicationName)}` +
      `&t=${encodeURIComponent(reminder.scheduledTime)}` +
      `&s=${token}`;

    const emailData = {
      medicationName: reminder.medicationName,
      instructions: reminder.instructions,
      scheduledTime: reminder.scheduledTime,
      currentTime,
      completeUrl,
    };

    const send = await sendEmail({
      to: recipient,
      subject: REMINDER_SUBJECT,
      html: renderReminderEmail(emailData),
      text: renderReminderText(emailData),
    });

    if (send.ok) {
      await ReminderHistory.updateOne(key, {
        $set: { emailSent: true, sentAt: new Date(), error: "" },
      });
      result.sent += 1;
      result.details.push({
        medicationName: reminder.medicationName,
        scheduledTime: reminder.scheduledTime,
        status: "sent",
      });
    } else {
      // Roll back the claim so the next cron run retries this dose.
      await ReminderHistory.deleteOne(key);
      result.failed += 1;
      result.details.push({
        medicationName: reminder.medicationName,
        scheduledTime: reminder.scheduledTime,
        status: "failed",
        error: send.error,
      });
    }
  }

  return result;
}
