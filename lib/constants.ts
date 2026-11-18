export const APP_NAME = "Hair Health Tracker";
export const APP_DESCRIPTION =
  "Track your hair-care medications and log daily completion.";

// Length of the emailed one-time code (the API enforces it; the UI uses it for copy).
export const OTP_LENGTH = 6;

/** Where people reach the operator about privacy requests. Set NEXT_PUBLIC_CONTACT_EMAIL. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

/** Update when the policy text changes. */
export const PRIVACY_UPDATED = "18 November 2026";
