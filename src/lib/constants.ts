/**
 * Static definitions for the single user's medication schedule.
 *
 * This is the source of truth used by the seed script to populate the
 * `medications` collection, and by `ensureDayLogs` to know which doses should
 * exist for a given day. Each dose has a stable `key` that is used everywhere
 * (logs, reminders, email links) so schedules can change without breaking
 * historical records.
 */

export type DoseSlot = "morning" | "night" | "day";

export interface DoseSeed {
  key: string;
  label: string; // e.g. "Morning", "Night", "Daily"
  slot: DoseSlot;
  time: string; // "HH:mm" 24h
  instructions: string[];
  warnings?: string[];
}

export interface MedicationSeed {
  slug: string;
  name: string;
  emoji: string;
  /** Tailwind color family used to theme the medication's cards/accents. */
  color: MedicationColor;
  summary: string;
  order: number;
  doses: DoseSeed[];
}

export type MedicationColor = "amber" | "sky" | "violet" | "emerald";

export const MEDICATIONS: MedicationSeed[] = [
  {
    slug: "biotin-hair-gummies",
    name: "Biotin Hair Gummies",
    emoji: "🐻",
    color: "amber",
    summary: "1 gummy daily for hair, skin & nails.",
    order: 1,
    doses: [
      {
        key: "biotin",
        label: "Daily",
        slot: "day",
        time: "14:00",
        instructions: [
          "Have 1 gummy daily.",
          "Preferably same time each day.",
          "Chew it well.",
        ],
      },
    ],
  },
  {
    slug: "minoxidil-spray",
    name: "Minoxidil Spray",
    emoji: "💧",
    color: "sky",
    summary: "Topical scalp spray, twice daily.",
    order: 2,
    doses: [
      {
        key: "minoxidil-morning",
        label: "Morning",
        slot: "morning",
        time: "08:00",
        instructions: [
          "Use after bath.",
          "Spray on affected scalp.",
          "Massage for 2 minutes.",
          "Patch test before first use.",
          "May cause irritation.",
        ],
      },
      {
        key: "minoxidil-night",
        label: "Night",
        slot: "night",
        time: "21:00",
        instructions: [
          "Use one hour before sleep.",
          "Spray on scalp.",
          "Massage for two minutes.",
          "Keep overnight.",
          "Maintain at least an eight hour gap between applications.",
          "Patch test before first use.",
          "Can cause irritation or dryness.",
        ],
      },
    ],
  },
  {
    slug: "hair-health-booster",
    name: "Hair Health Booster",
    emoji: "🌿",
    color: "violet",
    summary: "One tablet after meals, twice daily.",
    order: 3,
    doses: [
      {
        key: "booster-morning",
        label: "Morning",
        slot: "morning",
        time: "10:00",
        instructions: [
          "Take one tablet after meals.",
          "With water or ghee.",
          "Twice daily.",
        ],
      },
      {
        key: "booster-night",
        label: "Night",
        slot: "night",
        time: "21:00",
        instructions: [
          "Take one tablet after meals.",
          "With water or ghee.",
          "Twice daily.",
        ],
      },
    ],
  },
  {
    slug: "hair-growth-tablet",
    name: "Hair Growth Tablet",
    emoji: "💊",
    color: "emerald",
    summary: "One tablet after meal. Monitor blood pressure.",
    order: 4,
    doses: [
      {
        key: "growth",
        label: "Daily",
        slot: "morning",
        time: "10:00",
        instructions: [
          "One tablet after meal.",
          "Monitor blood pressure.",
        ],
        warnings: [
          "Breathlessness",
          "Rapid heart rate",
          "Swelling",
          "Rashes",
        ],
      },
    ],
  },
];

/** Flat list of every scheduled dose across all medications. */
export const ALL_DOSES = MEDICATIONS.flatMap((med) =>
  med.doses.map((dose) => ({ ...dose, medication: med })),
);

export const TOTAL_DAILY_DOSES = ALL_DOSES.length;

export type DoseStatus = "pending" | "completed" | "skipped" | "missed";

export const STATUS_META: Record<
  DoseStatus,
  { label: string; dot: string; text: string; bg: string; ring: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
  },
  skipped: {
    label: "Skipped",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
  },
  missed: {
    label: "Missed",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/30",
  },
  pending: {
    label: "Pending",
    dot: "bg-zinc-400",
    text: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-500/10",
    ring: "ring-zinc-500/20",
  },
};

/** Per-medication color classes (gradients & accents used across the UI). */
export const COLOR_META: Record<
  MedicationColor,
  { gradient: string; soft: string; text: string; ring: string; solid: string }
> = {
  amber: {
    gradient: "from-amber-400 to-orange-500",
    soft: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/30",
    solid: "bg-amber-500",
  },
  sky: {
    gradient: "from-sky-400 to-blue-500",
    soft: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/30",
    solid: "bg-sky-500",
  },
  violet: {
    gradient: "from-violet-400 to-purple-500",
    soft: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/30",
    solid: "bg-violet-500",
  },
  emerald: {
    gradient: "from-emerald-400 to-teal-500",
    soft: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/30",
    solid: "bg-emerald-500",
  },
};

/** Minutes after the scheduled time before a pending dose auto-marks missed. */
export const MISS_AFTER_MINUTES = 60;
