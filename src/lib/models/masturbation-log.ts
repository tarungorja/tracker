import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** One document per day tracking the count and individual event timestamps. */
const MasturbationLogSchema = new Schema(
  {
    dateKey: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    count: { type: Number, default: 0, min: 0 },
    events: { type: [Date], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true, collection: "masturbation_logs" },
);

MasturbationLogSchema.index({ dateKey: -1 });

export type MasturbationLogDoc = InferSchemaType<typeof MasturbationLogSchema>;

export const MasturbationLog: Model<MasturbationLogDoc> =
  (mongoose.models.MasturbationLog as Model<MasturbationLogDoc>) ||
  mongoose.model<MasturbationLogDoc>(
    "MasturbationLog",
    MasturbationLogSchema,
  );
