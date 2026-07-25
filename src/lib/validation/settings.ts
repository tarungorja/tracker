import { z } from "zod";

export const settingsSchema = z.object({
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  timezone: z.string().trim().min(1, "Timezone is required"),
  reminderEnabled: z.boolean(),
  reminderOffset: z.coerce.number().int().min(0).max(120),
  theme: z.enum(["light", "dark", "system"]),
  dailySummaryEmail: z.boolean(),
  weeklySummaryEmail: z.boolean(),
  dailySummaryTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24h)"),
});

export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsValues = z.output<typeof settingsSchema>;

/** A curated list of common timezones for the settings selector. */
export const TIMEZONES: string[] = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Pacific/Auckland",
];

export const REMINDER_OFFSETS: { value: number; label: string }[] = [
  { value: 0, label: "On time" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
];
