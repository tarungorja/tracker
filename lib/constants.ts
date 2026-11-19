export const APP_NAME = "Medication Tracker";
export const APP_DESCRIPTION =
  "Track your medications, log daily completion, and keep your family in the loop.";

// Length of the emailed one-time code (the API enforces it; the UI uses it for copy).
export const OTP_LENGTH = 6;

/** Where people reach the operator for help and for privacy / data requests. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "tarungorja1647@gmail.com";

/** Support phone number: the form used to dial, and the form people read. */
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+919347294521";
export const SUPPORT_PHONE_DISPLAY = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+91 93472 94521";

/** Update when the policy text changes. */
export const PRIVACY_UPDATED = "19 November 2026";
