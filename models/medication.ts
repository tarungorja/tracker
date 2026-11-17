import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const medicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
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
    // Weekdays the medication is taken on (0 = Sunday ... 6 = Saturday).
    daysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (days: number[]) =>
          days.length > 0 && days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: "Pick at least one day of the week.",
      },
    },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

medicationSchema.index({ userId: 1, name: 1 }, { unique: true });

export type MedicationDoc = InferSchemaType<typeof medicationSchema>;

export const Medication: Model<MedicationDoc> =
  (models.Medication as Model<MedicationDoc>) ??
  model<MedicationDoc>("Medication", medicationSchema);
