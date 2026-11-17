import { APP_NAME } from "@/lib/constants";
import { OTP_TTL_MS } from "@/lib/auth/otp-config";
import type { OtpPurpose } from "@/models";

// Brevo's transactional email REST API over HTTPS. SMTP is deliberately not used: many
// networks block SMTP ports, and serverless hosts restrict them.
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to your environment variables.`);
  return value;
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: OtpPurpose,
): Promise<void> {
  const apiKey = requireEnv("BREVO_API_KEY");
  const senderEmail = requireEnv("EMAIL_FROM");
  const senderName = process.env.EMAIL_FROM_NAME || APP_NAME;

  const minutes = Math.round(OTP_TTL_MS / 60_000);
  const action = purpose === "signup" ? "create your account" : "sign in";

  const textContent = [
    `Your ${APP_NAME} verification code is ${code}.`,
    `Use it to ${action}. It expires in ${minutes} minutes.`,
    "If you didn't request this, you can ignore this email.",
  ].join("\n\n");

  const htmlContent = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#18181b">
      <h2 style="margin:0 0 8px;font-size:18px">${APP_NAME}</h2>
      <p style="margin:0 0 16px;color:#52525b">Use this code to ${action}:</p>
      <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px">${code}</p>
      <p style="margin:0;color:#71717a;font-size:13px">This code expires in ${minutes} minutes. If you didn't request it, you can safely ignore this email.</p>
    </div>`;

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: `${code} is your ${APP_NAME} verification code`,
      htmlContent,
      textContent,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {}
    throw new Error(`Email provider error: ${detail}`);
  }
}
