"use server";

import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  generateOtp,
  hashOtp,
  verifyOtpHash,
} from "@/lib/auth/otp";
import { createSession, destroySession } from "@/lib/auth/session";
import { sendOtpEmail } from "@/lib/email";
import { OTP_PURPOSES, Otp, User } from "@/models";
import type { ActionResult } from "@/actions/logs";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);

const requestSchema = z.object({
  email: emailSchema,
  purpose: z.enum(OTP_PURPOSES),
});

export async function requestOtp(
  input: z.infer<typeof requestSchema>,
): Promise<ActionResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const { email, purpose } = parsed.data;

  try {
    await connectToDatabase();

    const user = await User.exists({ email });
    if (purpose === "signup" && user) {
      return { ok: false, error: "An account with this email already exists. Sign in instead." };
    }
    if (purpose === "signin" && !user) {
      return { ok: false, error: "No account found for this email. Sign up first." };
    }

    const existing = await Otp.findOne({ email, purpose }).lean();
    if (existing) {
      const waitMs = existing.sentAt.getTime() + OTP_RESEND_COOLDOWN_MS - Date.now();
      if (waitMs > 0) {
        return {
          ok: false,
          error: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`,
        };
      }
    }

    const code = generateOtp();
    const now = new Date();
    await Otp.updateOne(
      { email, purpose },
      {
        $set: {
          codeHash: hashOtp(email, code),
          attempts: 0,
          sentAt: now,
          expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        },
        $setOnInsert: { email, purpose },
      },
      { upsert: true },
    );

    try {
      await sendOtpEmail(email, code, purpose);
    } catch (error) {
      // Don't leave an unusable code (and its cooldown) behind if delivery failed.
      await Otp.deleteOne({ email, purpose });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not send the code.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send the code.",
    };
  }
}

const verifySchema = z.object({
  email: emailSchema,
  purpose: z.enum(OTP_PURPOSES),
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code.`),
});

export async function verifyOtp(
  input: z.infer<typeof verifySchema>,
): Promise<ActionResult> {
  const parsed = verifySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const { email, purpose, code } = parsed.data;

  try {
    await connectToDatabase();

    const otp = await Otp.findOne({ email, purpose });
    if (!otp || otp.expiresAt.getTime() <= Date.now()) {
      if (otp) await Otp.deleteOne({ _id: otp._id });
      return { ok: false, error: "That code has expired. Request a new one." };
    }

    if (!verifyOtpHash(email, code, otp.codeHash)) {
      const attempts = otp.attempts + 1;
      if (attempts >= OTP_MAX_ATTEMPTS) {
        await Otp.deleteOne({ _id: otp._id });
        return { ok: false, error: "Too many incorrect attempts. Request a new code." };
      }
      await Otp.updateOne({ _id: otp._id }, { $set: { attempts } });
      return { ok: false, error: "Incorrect code. Try again." };
    }

    // Delete the OTP as soon as it's verified; if another request already consumed it, stop.
    const consumed = await Otp.findOneAndDelete({ _id: otp._id });
    if (!consumed) return { ok: false, error: "That code has already been used." };

    let userId: string;
    if (purpose === "signup") {
      try {
        const user = await User.create({ email });
        userId = String(user._id);
      } catch (error) {
        if (error instanceof Error && error.message.includes("duplicate key")) {
          return { ok: false, error: "An account with this email already exists. Sign in instead." };
        }
        throw error;
      }
    } else {
      const user = await User.findOne({ email }).lean();
      if (!user) return { ok: false, error: "No account found for this email." };
      userId = String(user._id);
    }

    await createSession(userId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not verify the code.",
    };
  }
}

export async function signOut(): Promise<void> {
  await destroySession();
}
