import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One document per (day, dose). Created lazily by `ensureDayLogs` and mutated as
 * the user completes / skips / undoes a dose. This is the backbone of history,
 * the calendar and analytics.
 */
const DailyLogSchema = new Schema(
  {
    dateKey: { type: String, required: true }, // "YYYY-MM-DD" in user's tz
    doseKey: { type: String, required: true },
    medicationSlug: { type: String, required: true },
    medicationName: { type: String, required: true },
    emoji: { type: String, default: "💊" },
    color: { type: String, default: "sky" },
    doseLabel: { type: String, default: "" },
    slot: { type: String, default: "day" },
    scheduledTime: { type: String, required: true }, // "HH:mm"
    status: {
      type: String,
      enum: ["pending", "completed", "skipped", "missed"],
      default: "pending",
    },
    completedAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    missedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true, collection: "daily_logs" },
);

DailyLogSchema.index({ dateKey: 1, doseKey: 1 }, { unique: true });
DailyLogSchema.index({ dateKey: 1 });
DailyLogSchema.index({ status: 1 });

export type DailyLogDoc = InferSchemaType<typeof DailyLogSchema>;

export const DailyLog: Model<DailyLogDoc> =
  (mongoose.models.DailyLog as Model<DailyLogDoc>) ||
  mongoose.model<DailyLogDoc>("DailyLog", DailyLogSchema);
