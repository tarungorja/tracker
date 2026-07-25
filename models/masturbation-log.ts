import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * MasturbationLog
 * One row per day holding the running count and optional notes. Kept in its
 * own collection so the wellness tracker is fully independent of medications.
 */
const masturbationLogSchema = new Schema(
  {
    date: { type: String, required: true, unique: true, index: true }, // IST day key
    count: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export type MasturbationLogDoc = InferSchemaType<typeof masturbationLogSchema>;

export const MasturbationLog: Model<MasturbationLogDoc> =
  (models.MasturbationLog as Model<MasturbationLogDoc>) ??
  model<MasturbationLogDoc>("MasturbationLog", masturbationLogSchema);
