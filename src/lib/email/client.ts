import { Resend } from "resend";
import { env, isEmailConfigured } from "@/lib/env";

let client: Resend | null = null;

function getResend(): Resend | null {
  if (!isEmailConfigured) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

/** Send an email via Resend, degrading gracefully when unconfigured. */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { ok: false, skipped: true, error: "Email not configured" };
  if (!params.to) return { ok: false, skipped: true, error: "No recipient" };

  try {
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
