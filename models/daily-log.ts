import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * DailyLog
 * One row per dose per day: (date, medicationName, scheduledTime). Tracking
 * completion at the dose level lets the timeline show a status for every
 * scheduled slot and keeps streak/stat maths honest for twice-daily meds.
 */
const dailyLogSchema = new Schema(
  {
    date: { type: String, required: true, index: true }, // IST day key "YYYY-MM-DD"
    medicationName: { type: String, required: true },
    scheduledTime: { type: String, required: true }, // e.g. "8:00 AM"
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
    // Used only by the per-day wellness row (medicationName === WELLNESS_LOG_KEY);
    // ignored for medication doses, which leave it at 0.
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// A dose is uniquely identified by day + medication + time.
dailyLogSchema.index(
  { date: 1, medicationName: 1, scheduledTime: 1 },
  { unique: true },
);

export type DailyLogDoc = InferSchemaType<typeof dailyLogSchema>;

export const DailyLog: Model<DailyLogDoc> =
  (models.DailyLog as Model<DailyLogDoc>) ??
  model<DailyLogDoc>("DailyLog", dailyLogSchema);
