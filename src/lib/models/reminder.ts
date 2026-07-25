import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Dedup guard + status tracker for the cron reminder system. A unique
 * `dedupeKey` (e.g. `dose:2026-07-25:minoxidil-morning`) guarantees a reminder
 * is only sent once even if the cron endpoint is hit multiple times a minute.
 */
const ReminderSchema = new Schema(
  {
    dedupeKey: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["dose", "daily-summary", "weekly-summary"],
      default: "dose",
    },
    dateKey: { type: String, required: true },
    doseKey: { type: String, default: null },
    medicationName: { type: String, default: "" },
    scheduledTime: { type: String, default: "" },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped", "missed", "sent"],
      default: "sent",
    },
    completedAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    missedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "reminders" },
);

export type ReminderDoc = InferSchemaType<typeof ReminderSchema>;

export const Reminder: Model<ReminderDoc> =
  (mongoose.models.Reminder as Model<ReminderDoc>) ||
  mongoose.model<ReminderDoc>("Reminder", ReminderSchema);
