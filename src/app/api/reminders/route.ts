import { NextResponse, type NextRequest } from "next/server";
import { runReminders } from "@/lib/reminders/engine";
import { env, isDatabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** True when the request is authorised to run the cron job. */
function authorized(request: NextRequest): boolean {
  if (!env.CRON_SECRET) return true; // no secret configured => open (dev/personal)
  const header = request.headers.get("authorization");
  if (header === `Bearer ${env.CRON_SECRET}`) return true;
  const secret =
    request.nextUrl.searchParams.get("secret") ??
    request.nextUrl.searchParams.get("t");
  return secret === env.CRON_SECRET;
}

async function handle(request: NextRequest) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { ok: false, error: "Database not configured" },
      { status: 503 },
    );
  }
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("runReminders failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Reminder run failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
