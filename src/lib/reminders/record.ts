import { connectToDatabase } from "@/lib/db";
import { Reminder, NotificationHistory } from "@/lib/models";
import type { DoseStatus } from "@/types";

/**
 * Mirror a dose status change onto its reminder + notification-history records
 * so the notification log carries completedTime / skippedTime / missedTime.
 * No-op when no reminder was ever sent for the dose.
 */
export async function recordDoseOutcome(
  dateKey: string,
  doseKey: string,
  status: DoseStatus,
): Promise<void> {
  await connectToDatabase();
  const now = new Date();

  const set: Record<string, unknown> = {
    status,
    completedAt: status === "completed" ? now : null,
    skippedAt: status === "skipped" ? now : null,
    missedAt: status === "missed" ? now : null,
  };

  await Promise.all([
    Reminder.updateOne(
      { dedupeKey: `dose:${dateKey}:${doseKey}` },
      { $set: set },
    ),
    NotificationHistory.updateMany(
      { type: "dose", dateKey, doseKey },
      { $set: set },
    ),
  ]);
}
