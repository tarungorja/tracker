import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const dailyLogSchema = new Schema(
  {
    date: { type: String, required: true, index: true },
    medicationName: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

dailyLogSchema.index(
  { date: 1, medicationName: 1, scheduledTime: 1 },
  { unique: true },
);

export type DailyLogDoc = InferSchemaType<typeof dailyLogSchema>;

export const DailyLog: Model<DailyLogDoc> =
  (models.DailyLog as Model<DailyLogDoc>) ??
  model<DailyLogDoc>("DailyLog", dailyLogSchema);
