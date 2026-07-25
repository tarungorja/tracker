import { formatTime12 } from "@/lib/time";

/**
 * Reusable HTML email templates. All styling is inline for maximum client
 * compatibility. Colors mirror the app's indigo/status palette.
 */

const BRAND = "#4f46e5";
const INK = "#0b0b0f";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const SURFACE = "#ffffff";
const PAGE = "#f4f5f7";

function shell(previewText: string, inner: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
</head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${SURFACE};border:1px solid ${BORDER};border-radius:20px;overflow:hidden;">
      <tr><td style="padding:20px 28px;border-bottom:1px solid ${BORDER};">
        <table role="presentation" width="100%"><tr>
          <td style="font-size:16px;font-weight:700;color:${INK};">
            <span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;background:${BRAND};color:#fff;border-radius:8px;font-size:14px;vertical-align:middle;">✦</span>
            <span style="vertical-align:middle;margin-left:8px;">MedTrack</span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:28px;">${inner}</td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.6;">
        You're receiving this because reminders are enabled in MedTrack.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string, color: string): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:9999px;">${label}</a>`;
}

export function reminderEmail(params: {
  medicationName: string;
  emoji: string;
  doseLabel: string;
  time: string;
  instructions: string[];
  warnings: string[];
  completeUrl: string;
  skipUrl: string;
  appUrl: string;
}): { subject: string; html: string } {
  const {
    medicationName,
    emoji,
    doseLabel,
    time,
    instructions,
    warnings,
    completeUrl,
    skipUrl,
  } = params;

  const instructionsHtml = instructions.length
    ? `<ul style="margin:0;padding-left:18px;color:${INK};font-size:14px;line-height:1.8;">
        ${instructions.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}
      </ul>`
    : "";

  const warningsHtml = warnings.length
    ? `<div style="margin-top:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:12px 14px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:#dc2626;margin-bottom:6px;">⚠ Stop medication if</div>
        <div style="color:#b91c1c;font-size:13px;line-height:1.7;">${warnings.map(escapeHtml).join(" · ")}</div>
      </div>`
    : "";

  const inner = `
    <div style="text-align:center;">
      <div style="font-size:44px;line-height:1;">${emoji}</div>
      <div style="margin-top:10px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:${MUTED};">Time for your medication</div>
      <h1 style="margin:6px 0 2px;font-size:22px;color:${INK};">${escapeHtml(medicationName)}</h1>
      <div style="color:${MUTED};font-size:14px;">${escapeHtml(doseLabel)} · ${formatTime12(time)}</div>
    </div>

    <div style="margin-top:22px;background:${PAGE};border-radius:14px;padding:16px 18px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${MUTED};margin-bottom:8px;">Instructions</div>
      ${instructionsHtml}
    </div>
    ${warningsHtml}

    <div style="margin-top:24px;text-align:center;">
      ${button(completeUrl, "✓ Mark complete", "#10b981")}
      &nbsp;&nbsp;
      ${button(skipUrl, "Skip", "#f59e0b")}
    </div>
  `;

  return {
    subject: "Medication Reminder",
    html: shell(`Time for ${medicationName} — ${formatTime12(time)}`, inner),
  };
}

function statPill(label: string, value: string | number, color: string): string {
  return `<td style="padding:6px;" width="25%">
    <div style="background:${PAGE};border-radius:12px;padding:12px 8px;text-align:center;">
      <div style="font-size:22px;font-weight:700;color:${color};">${value}</div>
      <div style="font-size:11px;color:${MUTED};margin-top:2px;">${label}</div>
    </div>
  </td>`;
}

export function dailySummaryEmail(params: {
  dateLabel: string;
  completed: number;
  skipped: number;
  missed: number;
  total: number;
  completionPct: number;
  masturbationCount: number;
  appUrl: string;
}): { subject: string; html: string } {
  const inner = `
    <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:${MUTED};">Daily summary</div>
    <h1 style="margin:4px 0 2px;font-size:22px;color:${INK};">${escapeHtml(params.dateLabel)}</h1>
    <div style="color:${MUTED};font-size:14px;">You completed ${params.completed} of ${params.total} doses — ${params.completionPct}%.</div>

    <table role="presentation" width="100%" style="margin-top:20px;border-collapse:separate;">
      <tr>
        ${statPill("Completed", params.completed, "#10b981")}
        ${statPill("Skipped", params.skipped, "#f59e0b")}
        ${statPill("Missed", params.missed, "#ef4444")}
        ${statPill("Wellness", params.masturbationCount, BRAND)}
      </tr>
    </table>

    <div style="margin-top:22px;text-align:center;">
      ${button(params.appUrl, "Open MedTrack", BRAND)}
    </div>
  `;
  return {
    subject: `Daily summary — ${params.completionPct}% complete`,
    html: shell(`${params.completed}/${params.total} doses completed today`, inner),
  };
}

export function weeklySummaryEmail(params: {
  rangeLabel: string;
  completionPct: number;
  longestStreak: number;
  missedCount: number;
  masturbationTotal: number;
  perMedication: { name: string; emoji: string; completionPct: number }[];
  appUrl: string;
}): { subject: string; html: string } {
  const medRows = params.perMedication
    .map(
      (m) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${INK};">${m.emoji} ${escapeHtml(m.name)}</td>
        <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;color:${INK};">${m.completionPct}%</td>
      </tr>
      <tr><td colspan="2" style="padding-bottom:8px;">
        <div style="background:${BORDER};border-radius:9999px;height:8px;overflow:hidden;">
          <div style="background:${BRAND};height:8px;width:${m.completionPct}%;border-radius:9999px;"></div>
        </div>
      </td></tr>`,
    )
    .join("");

  const inner = `
    <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:${MUTED};">Weekly summary</div>
    <h1 style="margin:4px 0 2px;font-size:22px;color:${INK};">${escapeHtml(params.rangeLabel)}</h1>
    <div style="color:${MUTED};font-size:14px;">Overall adherence: ${params.completionPct}%.</div>

    <table role="presentation" width="100%" style="margin-top:20px;border-collapse:separate;">
      <tr>
        ${statPill("Adherence", `${params.completionPct}%`, "#10b981")}
        ${statPill("Longest streak", params.longestStreak, BRAND)}
        ${statPill("Missed", params.missedCount, "#ef4444")}
        ${statPill("Wellness", params.masturbationTotal, "#ec4899")}
      </tr>
    </table>

    <div style="margin-top:24px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${MUTED};">By medication</div>
    <table role="presentation" width="100%" style="margin-top:8px;">${medRows}</table>

    <div style="margin-top:20px;text-align:center;">
      ${button(params.appUrl, "View analytics", BRAND)}
    </div>
  `;
  return {
    subject: `Weekly summary — ${params.completionPct}% adherence`,
    html: shell(`Your week: ${params.completionPct}% adherence`, inner),
  };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
