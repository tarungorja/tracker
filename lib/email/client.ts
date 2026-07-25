import { Resend } from "resend";

import { APP_NAME } from "@/lib/constants";
import { env } from "@/lib/env";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Thin wrapper around Resend. Never throws — callers get a structured result
 * so a single failed email can't take down the whole cron run.
 */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  try {
    const { data, error } = await getClient().emails.send({
      from: env.FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });

    if (error) {
      return { ok: false, error: error.message ?? "Resend returned an error." };
    }
    return { ok: true, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error.";
    return { ok: false, error: message };
  }
}

export const REMINDER_SUBJECT = APP_NAME;
