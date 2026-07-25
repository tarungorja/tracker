import { type NextRequest } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { APP_NAME } from "@/lib/constants";
import { getAppUrl } from "@/lib/env";
import { verifyDose } from "@/lib/token";
import { istClockLabel } from "@/lib/time";
import { DailyLog } from "@/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Target of the "I have completed this" button in reminder emails.
 *
 * Uses a signed token so the link is safe to open without a session and can't
 * be forged. On success it marks the dose complete and returns a friendly
 * confirmation page (email clients can only issue GET requests).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const date = url.searchParams.get("d") ?? "";
  const medicationName = url.searchParams.get("m") ?? "";
  const scheduledTime = url.searchParams.get("t") ?? "";
  const token = url.searchParams.get("s") ?? "";

  if (!date || !medicationName || !scheduledTime || !token) {
    return htmlResponse(
      resultPage({
        ok: false,
        title: "Invalid link",
        message: "This completion link is missing information.",
      }),
      400,
    );
  }

  if (!verifyDose({ date, medicationName, scheduledTime }, token)) {
    return htmlResponse(
      resultPage({
        ok: false,
        title: "Link expired or invalid",
        message: "We couldn't verify this completion link.",
      }),
      401,
    );
  }

  try {
    await connectToDatabase();
    await DailyLog.updateOne(
      { date, medicationName, scheduledTime },
      {
        $set: { completed: true, completedAt: new Date() },
        $setOnInsert: { date, medicationName, scheduledTime },
      },
      { upsert: true },
    );

    return htmlResponse(
      resultPage({
        ok: true,
        title: "Dose completed 🎉",
        message: `${medicationName} at ${scheduledTime} is marked done. Logged at ${istClockLabel()} IST.`,
      }),
    );
  } catch {
    return htmlResponse(
      resultPage({
        ok: false,
        title: "Something went wrong",
        message: "We couldn't record your completion. Please try again from the app.",
      }),
      500,
    );
  }
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function resultPage({
  ok,
  title,
  message,
}: {
  ok: boolean;
  title: string;
  message: string;
}): string {
  const accent = ok ? "#16a34a" : "#dc2626";
  const emoji = ok ? "✓" : "!";
  const appUrl = getAppUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${APP_NAME}</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:420px;width:calc(100% - 32px);background:#18181b;border:1px solid #27272a;border-radius:24px;padding:40px 32px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.5);">
    <div style="width:72px;height:72px;margin:0 auto 20px;border-radius:20px;background:${accent}1a;color:${accent};display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;">${emoji}</div>
    <h1 style="margin:0 0 8px;font-size:22px;color:#fafafa;">${title}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#a1a1aa;">${message}</p>
    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:14px;">Open ${APP_NAME}</a>
  </div>
</body>
</html>`;
}
