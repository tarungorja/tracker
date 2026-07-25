import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DoseSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    slot: { type: String, enum: ["morning", "night", "day"], default: "day" },
    time: { type: String, required: true }, // "HH:mm"
    instructions: { type: [String], default: [] },
    warnings: { type: [String], default: [] },
  },
  { _id: false },
);

const MedicationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    emoji: { type: String, default: "💊" },
    color: {
      type: String,
      enum: ["amber", "sky", "violet", "emerald"],
      default: "sky",
    },
    summary: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    doses: { type: [DoseSchema], default: [] },
  },
  { timestamps: true, collection: "medications" },
);

export type MedicationDoc = InferSchemaType<typeof MedicationSchema>;

export const Medication: Model<MedicationDoc> =
  (mongoose.models.Medication as Model<MedicationDoc>) ||
  mongoose.model<MedicationDoc>("Medication", MedicationSchema);
