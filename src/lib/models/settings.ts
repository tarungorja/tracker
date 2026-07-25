import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DEFAULT_TIMEZONE } from "@/lib/time";

const SettingsSchema = new Schema(
  {
    // Singleton guard — there is only ever one settings document.
    key: { type: String, default: "singleton", unique: true, immutable: true },
    email: { type: String, default: "" },
    timezone: { type: String, default: DEFAULT_TIMEZONE },
    reminderEnabled: { type: Boolean, default: true },
    /** Minutes before a dose's scheduled time to send the reminder email. */
    reminderOffset: { type: Number, default: 0, min: 0, max: 120 },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    dailySummaryEmail: { type: Boolean, default: true },
    weeklySummaryEmail: { type: Boolean, default: true },
    /** When the daily summary is sent, "HH:mm" 24h. */
    dailySummaryTime: { type: String, default: "22:00" },
  },
  { timestamps: true, collection: "settings" },
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;

export const Settings: Model<SettingsDoc> =
  (mongoose.models.Settings as Model<SettingsDoc>) ||
  mongoose.model<SettingsDoc>("Settings", SettingsSchema);
