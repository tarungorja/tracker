import type { DoseStatus, MedicationColor } from "@/lib/constants";

export type { DoseStatus, MedicationColor };

/** A single scheduled dose for a given day, joined with its static info. */
export interface TimelineDose {
  id: string;
  dateKey: string;
  doseKey: string;
  medicationSlug: string;
  medicationName: string;
  emoji: string;
  color: MedicationColor;
  doseLabel: string;
  slot: string;
  scheduledTime: string; // "HH:mm"
  status: DoseStatus;
  completedAt: string | null;
  skippedAt: string | null;
  missedAt: string | null;
  notes: string;
  instructions: string[];
  warnings: string[];
}

export interface NextReminder {
  scheduledTime: string;
  medicationName: string;
  doseLabel: string;
  emoji: string;
  relativeDay: "today" | "tomorrow";
}

export interface DashboardStats {
  total: number;
  completed: number;
  skipped: number;
  missed: number;
  pending: number;
  remaining: number;
  completionPct: number;
  currentStreak: number;
  nextReminder: NextReminder | null;
}

export interface DashboardData {
  dateKey: string;
  timezone: string;
  doses: TimelineDose[];
  stats: DashboardStats;
  masturbationCount: number;
  emailConfigured: boolean;
}

export interface DayStatus {
  dateKey: string;
  total: number;
  completed: number;
  skipped: number;
  missed: number;
  pending: number;
  hasData: boolean;
  /** Dominant color bucket for the calendar cell. */
  tone: "completed" | "skipped" | "missed" | "partial" | "empty";
  masturbationCount: number;
}

export interface CalendarMonth {
  monthKey: string; // "YYYY-MM"
  label: string;
  days: DayStatus[];
  timezone: string;
}

export interface AnalyticsData {
  completionPct: number;
  weeklyAdherence: { label: string; dateKey: string; pct: number }[];
  monthlyAdherence: { label: string; pct: number }[];
  longestStreak: number;
  currentStreak: number;
  totalTaken: number;
  totalMissed: number;
  totalSkipped: number;
  perMedication: {
    slug: string;
    name: string;
    emoji: string;
    color: MedicationColor;
    completed: number;
    skipped: number;
    missed: number;
    completionPct: number;
  }[];
  mostSkipped: { name: string; emoji: string; count: number } | null;
  mostMissed: { name: string; emoji: string; count: number } | null;
  averageCompletionMinutes: number | null; // avg minutes after scheduled time
  rangeLabel: string;
}

export interface MasturbationData {
  todayCount: number;
  timezone: string;
  currentStreak: number; // days without
  highestDaily: number;
  monthlyAverage: number;
  totalAllTime: number;
  daily: { dateKey: string; count: number }[]; // recent (for lists)
  weekly: { label: string; count: number }[];
  monthly: { label: string; count: number }[];
  yearly: { label: string; count: number }[];
  heatmap: { dateKey: string; count: number }[]; // ~last 20 weeks
  todayNotes: string;
}

export interface ActionResult {
  ok: boolean;
  message?: string;
}
