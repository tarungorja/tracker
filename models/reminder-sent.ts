import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Records that a dose reminder was already sent, so repeated/overlapping cron runs
// never notify twice. The unique index makes "insert" the atomic claim.
const reminderSentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    medicationName: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

reminderSentSchema.index(
  { userId: 1, date: 1, medicationName: 1, scheduledTime: 1 },
  { unique: true },
);
// Entries are only needed for a short while.
reminderSentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });

export type ReminderSentDoc = InferSchemaType<typeof reminderSentSchema>;

export const ReminderSent: Model<ReminderSentDoc> =
  (models.ReminderSent as Model<ReminderSentDoc>) ??
  model<ReminderSentDoc>("ReminderSent", reminderSentSchema);
