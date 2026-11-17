import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const OTP_PURPOSES = ["signup", "signin"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },
    // HMAC of the code — the plaintext code is never stored.
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// One active OTP per email + purpose; a new request replaces the old one.
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });
// MongoDB removes the document automatically once `expiresAt` has passed.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpDoc = InferSchemaType<typeof otpSchema>;

export const Otp: Model<OtpDoc> =
  (models.Otp as Model<OtpDoc>) ?? model<OtpDoc>("Otp", otpSchema);
