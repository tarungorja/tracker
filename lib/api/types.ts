// Shapes of the JSON returned by the FastAPI backend (tracker-api). Keep in sync with its
// Pydantic schemas (app/schemas/*).

export type OtpPurpose = "signup" | "signin";

export type DoseStatus = "completed" | "pending" | "upcoming" | "missed";

export interface AuthUser {
  id: string;
  email: string;
}

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

export interface DayCompletion {
  date: string;
  total: number;
  completed: number;
  ratio: number;
}

// ---- dashboard ----------------------------------------------------------------------------

export interface NextReminder {
  medicationName: string;
  scheduledTime: string;
  minutesUntil: number;
  isTomorrow: boolean;
}

export interface DashboardData {
  todayKey: string;
  nowMinutes: number;
  doses: DoseView[];
  totalToday: number;
  completedToday: number;
  remainingToday: number;
  progress: number;
  currentStreak: number;
  nextReminder: NextReminder | null;
  medications: MedicationView[];
  heatmap: DayCompletion[];
}

// ---- today --------------------------------------------------------------------------------

export type TimelineDose = DoseView & { status: DoseStatus };

export interface TimelineSlot {
  time: string;
  minutes: number;
  doses: TimelineDose[];
}

export interface TodayData {
  todayKey: string;
  nowMinutes: number;
  slots: TimelineSlot[];
  total: number;
  completed: number;
}

// ---- medications --------------------------------------------------------------------------

export interface MedHistoryDay {
  date: string;
  total: number;
  completed: number;
  ratio: number;
}

export interface MedTodayDose {
  time: string;
  minutes: number;
  completed: boolean;
}

export interface MedicationWithHistory extends MedicationView {
  todayDoses: MedTodayDose[];
  completedToday: number;
  totalToday: number;
  history: MedHistoryDay[];
}

export interface MedicationsPageData {
  todayKey: string;
  nowMinutes: number;
  medications: MedicationWithHistory[];
}

// ---- statistics ---------------------------------------------------------------------------

export interface MedicationStat {
  name: string;
  total: number;
  completed: number;
  percent: number;
}

export interface StatisticsData {
  todayKey: string;
  overallPercent: number;
  overallCompleted: number;
  overallTotal: number;
  monthPercent: number;
  monthCompleted: number;
  monthTotal: number;
  currentStreak: number;
  longestStreak: number;
  missedReminders: number;
  heatmap: DayCompletion[];
  medicationStats: MedicationStat[];
}

// ---- wellness -----------------------------------------------------------------------------

export interface CountPoint {
  date: string;
  label: string;
  count: number;
}

export interface HistoryEntry {
  date: string;
  label: string;
  count: number;
  notes: string;
}

export interface WellnessData {
  todayKey: string;
  todayCount: number;
  todayNotes: string;
  weekly: CountPoint[];
  monthly: CountPoint[];
  calendar: CountPoint[];
  history: HistoryEntry[];
  totalThisYear: number;
  averagePerWeek: number;
  longestCleanStreak: number;
  currentCleanStreak: number;
  totalTracked: number;
}
