/**
 * Barrel for Mongoose models. Importing from here guarantees every schema is
 * registered before use.
 */
export { Medication, type MedicationDoc } from "@/models/medication";
export { DailyLog, type DailyLogDoc } from "@/models/daily-log";
export { ReminderHistory, type ReminderHistoryDoc } from "@/models/reminder-history";
export { MasturbationLog, type MasturbationLogDoc } from "@/models/masturbation-log";

/**
 * Shared, plain-object shapes returned to Client Components. Mongoose documents
 * are never passed across the server/client boundary directly — data helpers
 * map them to these serialisable types.
 */
export interface MedicationView {
  id: string;
  name: string;
  description: string;
  instructions: string;
  scheduleTimes: string[];
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
