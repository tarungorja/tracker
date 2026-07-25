import { connectToDatabase } from "@/lib/db";
import { DailyLog, type DailyLogDoc } from "@/lib/models";
import { ALL_DOSES, MISS_AFTER_MINUTES, type DoseStatus } from "@/lib/constants";
import { DOSE_INFO } from "@/lib/data/dose-info";
import {
  getDateKey,
  getMinutesOfDay,
  timeToMinutes,
} from "@/lib/time";
import type { TimelineDose } from "@/types";

/**
 * Make sure a DailyLog row exists for every scheduled dose on `dateKey`.
 * Idempotent — safe to call on every request.
 */
export async function ensureDayLogs(dateKey: string): Promise<void> {
  await connectToDatabase();

  const ops = ALL_DOSES.map((dose) => ({
    updateOne: {
      filter: { dateKey, doseKey: dose.key },
      update: {
        $setOnInsert: {
          dateKey,
          doseKey: dose.key,
          medicationSlug: dose.medication.slug,
          medicationName: dose.medication.name,
          emoji: dose.medication.emoji,
          color: dose.medication.color,
          doseLabel: dose.label,
          slot: dose.slot,
          scheduledTime: dose.time,
          status: "pending" as const,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length) await DailyLog.bulkWrite(ops, { ordered: false });
}

/**
 * Auto-mark overdue pending doses as "missed":
 *  - any pending dose on a past day, and
 *  - any pending dose today whose scheduled time was more than
 *    MISS_AFTER_MINUTES ago.
 */
export async function reconcileMissed(timezone: string): Promise<void> {
  await connectToDatabase();
  const todayKey = getDateKey(timezone);
  const nowMinutes = getMinutesOfDay(timezone);
  const now = new Date();

  // Past days: everything still pending is missed.
  await DailyLog.updateMany(
    { dateKey: { $lt: todayKey }, status: "pending" },
    { $set: { status: "missed", missedAt: now } },
  );

  // Today: pending doses whose window has elapsed.
  const todayPending = await DailyLog.find({
    dateKey: todayKey,
    status: "pending",
  })
    .select("_id scheduledTime")
    .lean();

  const overdueIds = todayPending
    .filter(
      (log) => nowMinutes - timeToMinutes(log.scheduledTime) > MISS_AFTER_MINUTES,
    )
    .map((log) => log._id);

  if (overdueIds.length) {
    await DailyLog.updateMany(
      { _id: { $in: overdueIds } },
      { $set: { status: "missed", missedAt: now } },
    );
  }
}

function toTimeline(log: DailyLogDoc & { _id: unknown }): TimelineDose {
  const info = DOSE_INFO.get(log.doseKey);
  return {
    id: String(log._id),
    dateKey: log.dateKey,
    doseKey: log.doseKey,
    medicationSlug: log.medicationSlug,
    medicationName: log.medicationName,
    emoji: log.emoji || info?.emoji || "💊",
    color: (log.color as TimelineDose["color"]) || info?.color || "sky",
    doseLabel: log.doseLabel,
    slot: log.slot,
    scheduledTime: log.scheduledTime,
    status: log.status as DoseStatus,
    completedAt: log.completedAt ? new Date(log.completedAt).toISOString() : null,
    skippedAt: log.skippedAt ? new Date(log.skippedAt).toISOString() : null,
    missedAt: log.missedAt ? new Date(log.missedAt).toISOString() : null,
    notes: log.notes || "",
    instructions: info?.instructions ?? [],
    warnings: info?.warnings ?? [],
  };
}

/** Timeline doses for a given day, ordered by scheduled time. */
export async function getDayDoses(dateKey: string): Promise<TimelineDose[]> {
  await connectToDatabase();
  const logs = await DailyLog.find({ dateKey }).lean();
  return logs
    .map((log) => toTimeline(log as DailyLogDoc & { _id: unknown }))
    .sort(
      (a, b) =>
        timeToMinutes(a.scheduledTime) - timeToMinutes(b.scheduledTime) ||
        a.medicationName.localeCompare(b.medicationName),
    );
}

/**
 * Apply a status change to a single dose. Used by both Server Actions and the
 * email action links. Returns the updated timeline dose (or null if unknown).
 */
export async function setDoseStatus(
  dateKey: string,
  doseKey: string,
  status: DoseStatus,
): Promise<TimelineDose | null> {
  await connectToDatabase();

  if (!DOSE_INFO.has(doseKey)) return null;

  const now = new Date();
  const set: Record<string, unknown> = {
    status,
    completedAt: status === "completed" ? now : null,
    skippedAt: status === "skipped" ? now : null,
    missedAt: status === "missed" ? now : null,
  };

  const info = DOSE_INFO.get(doseKey)!;

  const updated = await DailyLog.findOneAndUpdate(
    { dateKey, doseKey },
    {
      $set: set,
      $setOnInsert: {
        dateKey,
        doseKey,
        medicationSlug: info.medicationSlug,
        medicationName: info.medicationName,
        emoji: info.emoji,
        color: info.color,
        doseLabel: info.label,
        slot: info.slot,
        scheduledTime: info.time,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return updated ? toTimeline(updated as DailyLogDoc & { _id: unknown }) : null;
}

/** Persist a free-text note on a dose without changing its status. */
export async function setDoseNote(
  dateKey: string,
  doseKey: string,
  notes: string,
): Promise<void> {
  await connectToDatabase();
  const info = DOSE_INFO.get(doseKey);
  if (!info) return;
  await DailyLog.findOneAndUpdate(
    { dateKey, doseKey },
    {
      $set: { notes: notes.slice(0, 500) },
      $setOnInsert: {
        dateKey,
        doseKey,
        medicationSlug: info.medicationSlug,
        medicationName: info.medicationName,
        emoji: info.emoji,
        color: info.color,
        doseLabel: info.label,
        slot: info.slot,
        scheduledTime: info.time,
        status: "pending",
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
}
