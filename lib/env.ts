/**
 * Centralised, type-safe access to environment variables.
 *
 * Server-only secrets are read lazily so that importing this module in a
 * client bundle never throws — only the code paths that actually need a
 * secret will validate it.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to .env.local (see .env.example) or your Vercel project settings.`,
    );
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

export const env = {
  get MONGODB_URI(): string {
    return required("MONGODB_URI");
  },
  get RESEND_API_KEY(): string {
    return required("RESEND_API_KEY");
  },
  get FROM_EMAIL(): string {
    return optional("FROM_EMAIL", "Hair Reminder <onboarding@resend.dev>");
  },
  get NOTIFICATION_EMAIL(): string {
    return required("NOTIFICATION_EMAIL");
  },
  get CRON_SECRET(): string {
    return optional("CRON_SECRET");
  },
};

/**
 * Resolve the public base URL used to build absolute links inside emails.
 * Falls back to the Vercel-provided host, then localhost for dev.
 */
export function getAppUrl(): string {
  const explicit = optional("NEXT_PUBLIC_APP_URL");
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = optional("VERCEL_PROJECT_PRODUCTION_URL") || optional("VERCEL_URL");
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/**
 * Lightweight check used by the UI to show a friendly "not configured yet"
 * notice instead of crashing when secrets are missing. Never throws.
 */
export function isConfigured(): boolean {
  return Boolean(
    process.env.MONGODB_URI &&
      process.env.RESEND_API_KEY &&
      process.env.NOTIFICATION_EMAIL,
  );
}
