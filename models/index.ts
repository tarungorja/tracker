export { Medication, type MedicationDoc } from "@/models/medication";
export { DailyLog, type DailyLogDoc } from "@/models/daily-log";

export interface MedicationView {
  id: string;
  name: string;
  description: string;
  instructions: string;
  scheduleTimes: string[];
  intervalDays: number;
  startDateKey: string;
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
