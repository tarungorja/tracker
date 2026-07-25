import { APP_NAME } from "@/lib/constants";

export interface ReminderEmailData {
  medicationName: string;
  instructions: string;
  scheduledTime: string;
  currentTime: string;
  completeUrl: string;
}

/** Render bullet/section instruction text into safe HTML paragraphs. */
function renderInstructions(instructions: string): string {
  const escaped = instructions
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => line.trim())
    .map((line) => {
      if (line === "") return "";
      const isBullet = line.startsWith("•");
      const isHeading = /^[A-Z][A-Z\s]+$/.test(line) && line.length < 40;
      if (isBullet) {
        return `<div style="margin:2px 0 2px 8px;color:#3f3f46;font-size:14px;line-height:1.6;">${line}</div>`;
      }
      if (isHeading) {
        return `<div style="margin:12px 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;color:#a1a1aa;text-transform:uppercase;">${line}</div>`;
      }
      return `<div style="margin:2px 0;color:#3f3f46;font-size:14px;line-height:1.6;">${line}</div>`;
    })
    .join("");
}

/**
 * A responsive, dark-on-light HTML email with a large completion button.
 * Uses only inline styles + tables for maximum client compatibility.
 */
export function renderReminderEmail(data: ReminderEmailData): string {
  const { medicationName, instructions, scheduledTime, currentTime, completeUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(24,24,27,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:28px 32px;">
              <div style="font-size:13px;font-weight:600;letter-spacing:.12em;color:rgba(255,255,255,.75);text-transform:uppercase;">${APP_NAME}</div>
              <div style="margin-top:6px;font-size:24px;font-weight:800;color:#ffffff;">Time for your dose 💊</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <div style="font-size:13px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Medication</div>
              <div style="margin-top:4px;font-size:22px;font-weight:800;color:#18181b;">${medicationName}</div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="background:#f4f4f5;border-radius:14px;padding:12px 16px;">
                    <span style="font-size:12px;color:#71717a;">Scheduled</span>
                    <div style="font-size:16px;font-weight:700;color:#18181b;">${scheduledTime}</div>
                  </td>
                  <td width="12"></td>
                  <td style="background:#f4f4f5;border-radius:14px;padding:12px 16px;">
                    <span style="font-size:12px;color:#71717a;">Current time (IST)</span>
                    <div style="font-size:16px;font-weight:700;color:#18181b;">${currentTime}</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f0f0f2;">
                <div style="font-size:13px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Instructions</div>
                ${renderInstructions(instructions)}
              </div>

              <!-- Complete button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="${completeUrl}" target="_blank"
                       style="display:block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;padding:16px 24px;border-radius:16px;text-align:center;box-shadow:0 8px 20px rgba(22,163,74,.25);">
                      ✓ I have completed this
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;text-align:center;font-size:12px;color:#a1a1aa;">
                Tapping the button marks this dose done for today.
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0f0f2;">
              <div style="font-size:12px;color:#a1a1aa;text-align:center;">
                You're receiving this because reminders are enabled in ${APP_NAME}.
              </div>
            </td>
          </tr>
        </table>
        <div style="margin-top:16px;font-size:11px;color:#c4c4cc;">${APP_NAME} · Stay consistent 🌱</div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text fallback for clients that don't render HTML. */
export function renderReminderText(data: ReminderEmailData): string {
  return [
    `${APP_NAME} — time for your dose`,
    ``,
    `Medication: ${data.medicationName}`,
    `Scheduled: ${data.scheduledTime}`,
    `Current time (IST): ${data.currentTime}`,
    ``,
    `Instructions:`,
    data.instructions,
    ``,
    `Mark this dose complete:`,
    data.completeUrl,
  ].join("\n");
}
