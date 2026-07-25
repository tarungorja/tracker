import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * ReminderHistory
 * An audit row for every reminder email attempt. The unique index on
 * (date, medicationName, scheduledTime) is what guarantees we never send a
 * duplicate reminder for the same dose in the same day.
 */
const reminderHistorySchema = new Schema(
  {
    date: { type: String, required: true, index: true }, // IST day key
    medicationName: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    emailSent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

reminderHistorySchema.index(
  { date: 1, medicationName: 1, scheduledTime: 1 },
  { unique: true },
);

export type ReminderHistoryDoc = InferSchemaType<typeof reminderHistorySchema>;

export const ReminderHistory: Model<ReminderHistoryDoc> =
  (models.ReminderHistory as Model<ReminderHistoryDoc>) ??
  model<ReminderHistoryDoc>("ReminderHistory", reminderHistorySchema);
