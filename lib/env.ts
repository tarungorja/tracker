/**
 * Centralised, type-safe access to environment variables.
 *
 * Server-only values are read lazily so that importing this module in a client
 * bundle never throws — only the code paths that actually need one will
 * validate it.
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

export const env = {
  get MONGODB_URI(): string {
    return required("MONGODB_URI");
  },
};

/**
 * Lightweight check used by the UI to show a friendly "not configured yet"
 * notice instead of crashing when the database URL is missing. Never throws.
 */
export function isConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
