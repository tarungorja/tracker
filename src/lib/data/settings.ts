import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/lib/models";
import { env } from "@/lib/env";
import { DEFAULT_TIMEZONE } from "@/lib/time";

export interface AppSettings {
  email: string;
  timezone: string;
  reminderEnabled: boolean;
  reminderOffset: number;
  theme: "light" | "dark" | "system";
  dailySummaryEmail: boolean;
  weeklySummaryEmail: boolean;
  dailySummaryTime: string;
}

const DEFAULTS: AppSettings = {
  email: "",
  timezone: DEFAULT_TIMEZONE,
  reminderEnabled: true,
  reminderOffset: 0,
  theme: "system",
  dailySummaryEmail: true,
  weeklySummaryEmail: true,
  dailySummaryTime: "22:00",
};

/** Fetch the singleton settings document, creating it on first access. */
export async function getSettings(): Promise<AppSettings> {
  await connectToDatabase();
  const doc = await Settings.findOneAndUpdate(
    { key: "singleton" },
    { $setOnInsert: { key: "singleton" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    email: doc?.email || env.USER_EMAIL || DEFAULTS.email,
    timezone: doc?.timezone || DEFAULTS.timezone,
    reminderEnabled: doc?.reminderEnabled ?? DEFAULTS.reminderEnabled,
    reminderOffset: doc?.reminderOffset ?? DEFAULTS.reminderOffset,
    theme: (doc?.theme as AppSettings["theme"]) ?? DEFAULTS.theme,
    dailySummaryEmail: doc?.dailySummaryEmail ?? DEFAULTS.dailySummaryEmail,
    weeklySummaryEmail: doc?.weeklySummaryEmail ?? DEFAULTS.weeklySummaryEmail,
    dailySummaryTime: doc?.dailySummaryTime || DEFAULTS.dailySummaryTime,
  };
}

/** The effective recipient for reminder emails. */
export function resolveRecipient(settings: AppSettings): string {
  return settings.email || env.USER_EMAIL || "";
}
