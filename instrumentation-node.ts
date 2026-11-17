// Node-runtime startup hook (see instrumentation.ts).
//
// Checks for due medication reminders every minute from inside the server, in development
// and in production wherever the server stays running (`next start` on a VM/container).
//
// It is NOT started on Vercel: serverless instances are short-lived and frozen between
// requests, so a timer can't be trusted there. On Vercel, call
//   GET /api/cron/send-reminders   with   "Authorization: Bearer $CRON_SECRET"
// every minute from Vercel Cron (Pro) or an external scheduler instead.
//
// Overlapping runs (several instances, timer + cron together) are safe: each dose is only
// ever claimed once. Set DISABLE_REMINDER_TIMER=1 to turn the timer off.
import { sendDueReminders } from "@/lib/reminders";

const globals = globalThis as { _reminderTimer?: ReturnType<typeof setInterval> };

const onVercel = Boolean(process.env.VERCEL);
const disabled = process.env.DISABLE_REMINDER_TIMER === "1";

if (!onVercel && !disabled && !globals._reminderTimer) {
  // ^ the last check survives hot reloads without stacking timers
  const tick = () => {
    sendDueReminders()
      .then((r) => {
        if (r.notificationsSent > 0 || r.failures > 0) console.log("[reminders]", r);
      })
      .catch((error) => console.error("[reminders] run failed:", error));
  };

  globals._reminderTimer = setInterval(tick, 60_000);
  console.log(`[reminders] timer started in ${process.env.NODE_ENV} (checks every 60s)`);
  tick();
}
