export const IST_TIMEZONE = "Asia/Kolkata";

const IST_OFFSET_MINUTES = 5 * 60 + 30;

export interface ISTParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
}

const PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: IST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  weekday: "short",
});

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getISTParts(date: Date = new Date()): ISTParts {
  const parts = PARTS_FORMATTER.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "0" : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: WEEKDAY_INDEX[map.weekday ?? "Sun"] ?? 0,
  };
}

export function parseScheduleToMinutes(label: string): number | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function istDateKeyToUTC(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);

  const utcMillis = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 0, 0, 0) -
    IST_OFFSET_MINUTES * 60_000;
  return new Date(utcMillis);
}

export function weekdayOfKey(dateKey: string): number {
  return getISTParts(istDateKeyToUTC(dateKey)).weekday;
}

export function shortDateLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(istDateKeyToUTC(dateKey));
}

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Human summary of a set of weekdays (0 = Sunday), e.g. "Every day", "Mon, Wed, Fri". */
export function formatDaysOfWeek(days: readonly number[]): string {
  const set = new Set(days);
  if (set.size === 7) return "Every day";
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return "Weekdays";
  if (set.size === 2 && set.has(0) && set.has(6)) return "Weekends";
  return Array.from(set)
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_SHORT[d])
    .join(", ");
}

/** "2:00 PM" -> "14:00" (the value format of <input type="time">). */
export function labelToTimeInput(label: string): string {
  const minutes = parseScheduleToMinutes(label);
  if (minutes === null) return "";
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

const WHEN_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIMEZONE,
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TIMEZONE });

/** "Today, 9:05 am" for today (IST), otherwise "7 Jan, 9:05 am". For timestamps from the API. */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (DAY_FORMATTER.format(date) === DAY_FORMATTER.format(now)) {
    return `Today, ${TIME_FORMATTER.format(date)}`;
  }
  return WHEN_FORMATTER.format(date);
}
