/**
 * Centralised, typed access to environment variables.
 * Nothing here throws at import time so the app can boot (and pages can render
 * a helpful "not configured" state) even before `.env.local` is filled in.
 */

export const env = {
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  RESEND_FROM: process.env.RESEND_FROM ?? "Medication Tracker <onboarding@resend.dev>",
  USER_EMAIL: process.env.USER_EMAIL ?? "",
  /** Optional shared secret to protect the cron endpoint. */
  CRON_SECRET: process.env.CRON_SECRET ?? "",
  /**
   * Absolute base URL used to build links inside emails.
   * On Vercel this is auto-detected from the production domain, so you only
   * need to set APP_URL manually for a custom domain or non-Vercel host.
   */
  APP_URL:
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
} as const;

export const isDatabaseConfigured = Boolean(env.MONGODB_URI);
export const isEmailConfigured = Boolean(env.RESEND_API_KEY);
