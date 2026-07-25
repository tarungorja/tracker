import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

/**
 * Signed tokens for the "I have completed this" email button.
 *
 * Email clients can only issue GET requests via links, so the completion link
 * must be safe to open without a session. We sign each (date, medication,
 * time) tuple with an HMAC keyed by the server-only RESEND_API_KEY, so links
 * cannot be forged and cannot be reused for a different dose.
 */

function signingKey(): string {
  // RESEND_API_KEY is server-only and always present in a configured app.
  return env.RESEND_API_KEY;
}

export interface DoseIdentity {
  date: string; // IST day key
  medicationName: string;
  scheduledTime: string; // e.g. "8:00 AM"
}

export function signDose({ date, medicationName, scheduledTime }: DoseIdentity): string {
  const payload = `${date}|${medicationName}|${scheduledTime}`;
  return createHmac("sha256", signingKey()).update(payload).digest("hex");
}

export function verifyDose(identity: DoseIdentity, token: string): boolean {
  const expected = signDose(identity);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(token, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
