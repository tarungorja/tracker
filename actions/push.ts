"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { isPushConfigured } from "@/lib/firebase/admin";
import { sendPushToUser } from "@/lib/push";
import { PushToken } from "@/models";
import type { ActionResult } from "@/actions/logs";

const tokenSchema = z.object({
  token: z.string().min(20).max(4096),
  userAgent: z.string().max(500).optional(),
});

/** Registers this browser's FCM token for the signed-in user (re-assigning it if it was another user's). */
export async function savePushToken(
  input: z.infer<typeof tokenSchema>,
): Promise<ActionResult> {
  const parsed = tokenSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid notification token." };
  const user = await requireUser();

  try {
    await connectToDatabase();
    await PushToken.updateOne(
      { token: parsed.data.token },
      {
        $set: {
          userId: user.id,
          sessionId: user.sessionId,
          userAgent: parsed.data.userAgent ?? "",
        },
      },
      { upsert: true },
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not enable notifications.",
    };
  }
}

/** Unregisters a token. Only removes tokens owned by the signed-in user. */
export async function removePushToken(input: { token: string }): Promise<ActionResult> {
  const parsed = z.object({ token: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid notification token." };
  const user = await requireUser();

  try {
    await connectToDatabase();
    await PushToken.deleteOne({ token: parsed.data.token, userId: user.id });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not disable notifications.",
    };
  }
}

export async function sendTestNotification(): Promise<ActionResult & { sent?: number }> {
  const user = await requireUser();
  if (!isPushConfigured()) {
    return { ok: false, error: "Push sending isn't configured on the server yet (FIREBASE_SERVICE_ACCOUNT)." };
  }

  try {
    const { sent, error } = await sendPushToUser(user.id, {
      title: "Test notification",
      body: "Reminders are working. You'll be notified when it's time for a dose.",
      url: "/today",
      tag: "test",
    });
    if (sent === 0) {
      return {
        ok: false,
        error: error
          ? `Firebase could not deliver it: ${error}`
          : "No device is registered for this account. Turn reminders off and on again.",
      };
    }
    return { ok: true, sent };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send the test notification.",
    };
  }
}
