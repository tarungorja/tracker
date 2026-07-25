import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const medicationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    scheduleTimes: {
      type: [String],
      default: [],
      validate: {
        validator: (times: string[]) => times.length > 0,
        message: "A medication needs at least one schedule time.",
      },
    },
    intervalDays: { type: Number, default: 1, min: 1 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type MedicationDoc = InferSchemaType<typeof medicationSchema>;

export const Medication: Model<MedicationDoc> =
  (models.Medication as Model<MedicationDoc>) ??
  model<MedicationDoc>("Medication", medicationSchema);
