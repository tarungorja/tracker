import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// One FCM registration token per browser/device. A token belongs to one user at a time.
const pushTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

export type PushTokenDoc = InferSchemaType<typeof pushTokenSchema>;

export const PushToken: Model<PushTokenDoc> =
  (models.PushToken as Model<PushTokenDoc>) ??
  model<PushTokenDoc>("PushToken", pushTokenSchema);
