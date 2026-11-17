export { Medication, type MedicationDoc } from "@/models/medication";
export { DailyLog, type DailyLogDoc } from "@/models/daily-log";
export { User, type UserDoc } from "@/models/user";
export { Otp, type OtpDoc, type OtpPurpose, OTP_PURPOSES } from "@/models/otp";
export { Session, type SessionDoc } from "@/models/session";
export { PushToken, type PushTokenDoc } from "@/models/push-token";
export { ReminderSent, type ReminderSentDoc } from "@/models/reminder-sent";

export interface MedicationView {
  id: string;
  name: string;
  description: string;
  instructions: string;
  scheduleTimes: string[];
  daysOfWeek: number[];
  enabled: boolean;
}

export interface DoseView {
  medicationName: string;
  scheduledTime: string;
  scheduledMinutes: number;
  completed: boolean;
  completedAt: string | null;
}

export type DoseStatus = "completed" | "pending" | "upcoming" | "missed";
