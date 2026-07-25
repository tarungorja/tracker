import { NextResponse, type NextRequest } from "next/server";

import { env, isConfigured } from "@/lib/env";
import { runReminderCycle } from "@/lib/reminders/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Invoked by Vercel Cron every 5 minutes (see vercel.json).
 *
 * When CRON_SECRET is set, Vercel sends it as a Bearer token — we reject any
 * request that doesn't present it, so the endpoint can't be triggered by
 * strangers. If no secret is configured the endpoint stays open (handy for
 * local testing) but does nothing harmful beyond sending due reminders.
 */
export async function GET(request: NextRequest) {
  const secret = env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const url = new URL(request.url);
    const provided = auth?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "App is not configured (missing environment variables)." },
      { status: 503 },
    );
  }

  try {
    const result = await runReminderCycle();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reminder cycle failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
