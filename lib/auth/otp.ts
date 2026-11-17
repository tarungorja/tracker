import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { OTP_LENGTH } from "@/lib/auth/otp-config";

export * from "@/lib/auth/otp-config";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET. Add it to .env.development.");
  }
  return secret;
}

export function generateOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

export function hashOtp(email: string, code: string): string {
  return createHmac("sha256", authSecret()).update(`${email}:${code}`).digest("hex");
}

export function verifyOtpHash(email: string, code: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashOtp(email, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
