import { connectToDatabase } from "@/lib/db";
import {
  DailyLog,
  Reminder,
  NotificationHistory,
} from "@/lib/models";
import { getSettings, resolveRecipient } from "@/lib/data/settings";
import { ensureDayLogs, reconcileMissed, getDayDoses } from "@/lib/data/logs";
import {
  getDailyAggregates,
  getMasturbationCounts,
  isPerfectDay,
} from "@/lib/data/aggregate";
import { DOSE_INFO } from "@/lib/data/dose-info";
import { MEDICATIONS } from "@/lib/constants";
import { env } from "@/lib/env";
import {
  getDateKey,
  getMinutesOfDay,
  timeToMinutes,
  weekdayOf,
  addDaysKey,
  rangeKeys,
  formatDayLabel,
  formatMonthLabel,
} from "@/lib/time";
import { round } from "@/lib/utils";
import {
  reminderEmail,
  dailySummaryEmail,
  weeklySummaryEmail,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/client";

/** How long after the scheduled send time a reminder may still fire (min). */
const REMIND_GRACE = 30;
/** How long after the summary time it may still fire (min). */
const SUMMARY_GRACE = 120;

export interface ReminderRunResult {
  ran: boolean;
  timezone: string;
  now: string;
  remindersSent: string[];
  missedMarked: number;
  dailySummarySent: boolean;
  weeklySummarySent: boolean;
  skipped?: string;
  errors: string[];
}

function actionUrl(kind: "complete" | "skip", date: string, dose: string) {
  const url = new URL("/api/action", env.APP_URL);
  url.searchParams.set("date", date);
  url.searchParams.set("dose", dose);
  url.searchParams.set("do", kind);
  if (env.CRON_SECRET) url.searchParams.set("t", env.CRON_SECRET);
  return url.toString();
}

/**
 * Atomically claim a reminder via the unique `dedupeKey`. Returns true if this
 * caller won the claim (i.e. it should send), false if it was already sent.
 */
async function claim(
  dedupeKey: string,
  base: Record<string, unknown>,
): Promise<boolean> {
  try {
    await Reminder.create({ dedupeKey, ...base });
    return true;
  } catch (error: unknown) {
    // Duplicate key => already handled by a previous run.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return false;
    }
    throw error;
  }
}

export async function runReminders(): Promise<ReminderRunResult> {
  await connectToDatabase();
  const settings = await getSettings();
  const timezone = settings.timezone;
  const todayKey = getDateKey(timezone);
  const nowMinutes = getMinutesOfDay(timezone);
  const now = new Date();

  const result: ReminderRunResult = {
    ran: true,
    timezone,
    now: getDateKey(timezone) + " " + String(nowMinutes),
    remindersSent: [],
    missedMarked: 0,
    dailySummarySent: false,
    weeklySummarySent: false,
    errors: [],
  };

  await ensureDayLogs(todayKey);
  await reconcileMissed(timezone);

  // Record missed times onto reminder/notification records (once).
  const missedToday = await DailyLog.find({
    dateKey: todayKey,
    status: "missed",
  })
    .select("doseKey missedAt")
    .lean();
  result.missedMarked = missedToday.length;
  await Promise.all(
    missedToday.map(async (log) => {
      const set = { status: "missed" as const, missedAt: log.missedAt ?? now };
      await Reminder.updateOne(
        { dedupeKey: `dose:${todayKey}:${log.doseKey}`, missedAt: null },
        { $set: set },
      );
      await NotificationHistory.updateMany(
        { type: "dose", dateKey: todayKey, doseKey: log.doseKey, missedAt: null },
        { $set: set },
      );
    }),
  );

  const recipient = resolveRecipient(settings);

  // ---- Dose reminders ----
  if (settings.reminderEnabled && recipient) {
    const doses = await getDayDoses(todayKey);
    for (const dose of doses) {
      if (dose.status !== "pending") continue;
      const targetMinutes = timeToMinutes(dose.scheduledTime) - settings.reminderOffset;
      const delta = nowMinutes - targetMinutes;
      if (delta < 0 || delta > REMIND_GRACE) continue;

      const dedupeKey = `dose:${todayKey}:${dose.doseKey}`;
      const won = await claim(dedupeKey, {
        type: "dose",
        dateKey: todayKey,
        doseKey: dose.doseKey,
        medicationName: dose.medicationName,
        scheduledTime: dose.scheduledTime,
        status: "sent",
      });
      if (!won) continue;

      const info = DOSE_INFO.get(dose.doseKey);
      const { subject, html } = reminderEmail({
        medicationName: dose.medicationName,
        emoji: dose.emoji,
        doseLabel: dose.doseLabel,
        time: dose.scheduledTime,
        instructions: info?.instructions ?? dose.instructions,
        warnings: info?.warnings ?? dose.warnings,
        completeUrl: actionUrl("complete", todayKey, dose.doseKey),
        skipUrl: actionUrl("skip", todayKey, dose.doseKey),
        appUrl: env.APP_URL,
      });

      const sent = await sendEmail({ to: recipient, subject, html });
      await Reminder.updateOne(
        { dedupeKey },
        { $set: { emailSent: sent.ok, emailSentAt: sent.ok ? now : null } },
      );
      await NotificationHistory.create({
        type: "dose",
        dateKey: todayKey,
        doseKey: dose.doseKey,
        medicationName: dose.medicationName,
        scheduledTime: dose.scheduledTime,
        subject,
        status: "sent",
        emailSent: sent.ok,
        emailSentAt: sent.ok ? now : null,
        error: sent.error ?? "",
      });

      if (sent.ok) result.remindersSent.push(dose.doseKey);
      else if (sent.error) result.errors.push(`${dose.doseKey}: ${sent.error}`);
    }
  }

  // ---- Daily summary ----
  const summaryMinutes = timeToMinutes(settings.dailySummaryTime);
  const summaryDelta = nowMinutes - summaryMinutes;
  if (
    settings.dailySummaryEmail &&
    recipient &&
    summaryDelta >= 0 &&
    summaryDelta <= SUMMARY_GRACE
  ) {
    const dedupeKey = `daily-summary:${todayKey}`;
    const won = await claim(dedupeKey, {
      type: "daily-summary",
      dateKey: todayKey,
      status: "sent",
    });
    if (won) {
      try {
        const agg = (await getDailyAggregates(todayKey, todayKey)).get(todayKey);
        const total = agg?.total ?? 0;
        const completed = agg?.completed ?? 0;
        const mast = (await getMasturbationCounts(todayKey, todayKey)).get(todayKey) ?? 0;
        const { subject, html } = dailySummaryEmail({
          dateLabel: formatDayLabel(todayKey),
          completed,
          skipped: agg?.skipped ?? 0,
          missed: agg?.missed ?? 0,
          total,
          completionPct: total ? round((completed / total) * 100) : 0,
          masturbationCount: mast,
          appUrl: env.APP_URL,
        });
        const sent = await sendEmail({ to: recipient, subject, html });
        await Reminder.updateOne(
          { dedupeKey },
          { $set: { emailSent: sent.ok, emailSentAt: sent.ok ? now : null } },
        );
        await NotificationHistory.create({
          type: "daily-summary",
          dateKey: todayKey,
          subject,
          status: "sent",
          emailSent: sent.ok,
          emailSentAt: sent.ok ? now : null,
          error: sent.error ?? "",
        });
        result.dailySummarySent = sent.ok;
        if (!sent.ok && sent.error) result.errors.push(`daily: ${sent.error}`);
      } catch (error) {
        result.errors.push(
          `daily: ${error instanceof Error ? error.message : "failed"}`,
        );
      }
    }
  }

  // ---- Weekly summary (Sundays) ----
  if (
    settings.weeklySummaryEmail &&
    recipient &&
    weekdayOf(todayKey) === 0 &&
    summaryDelta >= 0 &&
    summaryDelta <= SUMMARY_GRACE
  ) {
    const dedupeKey = `weekly-summary:${todayKey}`;
    const won = await claim(dedupeKey, {
      type: "weekly-summary",
      dateKey: todayKey,
      status: "sent",
    });
    if (won) {
      try {
        const data = await buildWeeklySummary(todayKey);
        const { subject, html } = weeklySummaryEmail({ ...data, appUrl: env.APP_URL });
        const sent = await sendEmail({ to: recipient, subject, html });
        await Reminder.updateOne(
          { dedupeKey },
          { $set: { emailSent: sent.ok, emailSentAt: sent.ok ? now : null } },
        );
        await NotificationHistory.create({
          type: "weekly-summary",
          dateKey: todayKey,
          subject,
          status: "sent",
          emailSent: sent.ok,
          emailSentAt: sent.ok ? now : null,
          error: sent.error ?? "",
        });
        result.weeklySummarySent = sent.ok;
        if (!sent.ok && sent.error) result.errors.push(`weekly: ${sent.error}`);
      } catch (error) {
        result.errors.push(
          `weekly: ${error instanceof Error ? error.message : "failed"}`,
        );
      }
    }
  }

  return result;
}

async function buildWeeklySummary(todayKey: string) {
  const sinceKey = addDaysKey(todayKey, -6);
  const aggregates = await getDailyAggregates(sinceKey, todayKey);

  let completed = 0;
  let resolved = 0;
  let missed = 0;
  for (const agg of aggregates.values()) {
    completed += agg.completed;
    resolved += agg.completed + agg.skipped + agg.missed;
    missed += agg.missed;
  }

  // Longest perfect-day run within a 60-day window.
  const longAgg = await getDailyAggregates(addDaysKey(todayKey, -59), todayKey);
  let longestStreak = 0;
  let run = 0;
  for (const key of rangeKeys(addDaysKey(todayKey, -59), todayKey)) {
    if (isPerfectDay(longAgg.get(key))) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else run = 0;
  }

  const mastMap = await getMasturbationCounts(sinceKey, todayKey);
  let masturbationTotal = 0;
  for (const c of mastMap.values()) masturbationTotal += c;

  // Per medication completion % over the week.
  const rows = await DailyLog.aggregate<{
    _id: { slug: string; status: string };
    count: number;
  }>([
    { $match: { dateKey: { $gte: sinceKey, $lte: todayKey } } },
    {
      $group: {
        _id: { slug: "$medicationSlug", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);
  const bySlug = new Map<string, { completed: number; resolved: number }>();
  for (const r of rows) {
    const cur = bySlug.get(r._id.slug) ?? { completed: 0, resolved: 0 };
    if (r._id.status === "completed") cur.completed += r.count;
    if (["completed", "skipped", "missed"].includes(r._id.status))
      cur.resolved += r.count;
    bySlug.set(r._id.slug, cur);
  }
  const perMedication = MEDICATIONS.map((m) => {
    const c = bySlug.get(m.slug) ?? { completed: 0, resolved: 0 };
    return {
      name: m.name,
      emoji: m.emoji,
      completionPct: c.resolved ? round((c.completed / c.resolved) * 100) : 0,
    };
  });

  return {
    rangeLabel: `${formatDayLabel(sinceKey)} – ${formatDayLabel(todayKey)}, ${formatMonthLabel(todayKey).split(" ")[1]}`,
    completionPct: resolved ? round((completed / resolved) * 100) : 0,
    longestStreak,
    missedCount: missed,
    masturbationTotal,
    perMedication,
  };
}
