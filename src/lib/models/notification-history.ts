import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** Append-only log of every reminder / summary email the system sends. */
const NotificationHistorySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["dose", "daily-summary", "weekly-summary"],
      default: "dose",
    },
    dateKey: { type: String, required: true },
    doseKey: { type: String, default: null },
    medicationName: { type: String, default: "" },
    scheduledTime: { type: String, default: "" },
    subject: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped", "missed", "sent"],
      default: "sent",
    },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    missedAt: { type: Date, default: null },
    error: { type: String, default: "" },
  },
  { timestamps: true, collection: "notification_history" },
);

NotificationHistorySchema.index({ createdAt: -1 });

export type NotificationHistoryDoc = InferSchemaType<
  typeof NotificationHistorySchema
>;

export const NotificationHistory: Model<NotificationHistoryDoc> =
  (mongoose.models.NotificationHistory as Model<NotificationHistoryDoc>) ||
  mongoose.model<NotificationHistoryDoc>(
    "NotificationHistory",
    NotificationHistorySchema,
  );
