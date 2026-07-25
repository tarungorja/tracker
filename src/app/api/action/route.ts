import { type NextRequest } from "next/server";
import { setDoseStatus } from "@/lib/data/logs";
import { recordDoseOutcome } from "@/lib/reminders/record";
import { DOSE_INFO } from "@/lib/data/dose-info";
import { env, isDatabaseConfigured } from "@/lib/env";
import { formatTime12 } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function page(opts: {
  ok: boolean;
  heading: string;
  message: string;
  emoji: string;
}): Response {
  const accent = opts.ok ? "#10b981" : "#ef4444";
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MedTrack</title>
<meta http-equiv="refresh" content="4;url=${env.APP_URL}" />
<style>
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f5f7;color:#0b0b0f;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:24px;max-width:420px;width:100%;padding:36px 28px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.06);}
  .emoji{font-size:52px;line-height:1;}
  h1{font-size:22px;margin:16px 0 6px;}
  p{color:#6b7280;font-size:15px;margin:0 0 22px;}
  a{display:inline-block;background:${accent};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:9999px;}
</style></head>
<body><div class="card">
  <div class="emoji">${opts.emoji}</div>
  <h1>${opts.heading}</h1>
  <p>${opts.message}</p>
  <a href="${env.APP_URL}">Open MedTrack</a>
</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured) {
    return page({
      ok: false,
      emoji: "⚙️",
      heading: "Not configured",
      message: "The app database is not set up yet.",
    });
  }

  const params = request.nextUrl.searchParams;
  const date = params.get("date") ?? "";
  const dose = params.get("dose") ?? "";
  const action = params.get("do") ?? "";
  const token = params.get("t") ?? "";

  if (env.CRON_SECRET && token !== env.CRON_SECRET) {
    return page({
      ok: false,
      emoji: "🔒",
      heading: "Link expired",
      message: "This action link is no longer valid.",
    });
  }

  const info = DOSE_INFO.get(dose);
  if (
    !DATE_RE.test(date) ||
    !info ||
    (action !== "complete" && action !== "skip")
  ) {
    return page({
      ok: false,
      emoji: "❓",
      heading: "Invalid link",
      message: "We couldn't understand that request.",
    });
  }

  const status = action === "complete" ? "completed" : "skipped";
  try {
    await setDoseStatus(date, dose, status);
    await recordDoseOutcome(date, dose, status);
  } catch (error) {
    console.error("email action failed", error);
    return page({
      ok: false,
      emoji: "⚠️",
      heading: "Something went wrong",
      message: "Please open the app and try again.",
    });
  }

  if (status === "completed") {
    return page({
      ok: true,
      emoji: "✅",
      heading: "Marked complete",
      message: `${info.medicationName} (${info.label} · ${formatTime12(info.time)}) is done. Nice work!`,
    });
  }
  return page({
    ok: false,
    emoji: "⏭️",
    heading: "Marked skipped",
    message: `${info.medicationName} (${info.label}) was skipped for today.`,
  });
}
