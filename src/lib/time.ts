/**
 * Timezone-aware date/time helpers.
 *
 * The whole app reasons about "days" using a `YYYY-MM-DD` string computed in the
 * user's configured timezone, and about clock times using `HH:mm` (24h). This
 * avoids pulling in date-fns-tz while staying correct across timezones by using
 * the built-in `Intl.DateTimeFormat`.
 */

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export type DateParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  weekday: number; // 0 (Sun) - 6 (Sat)
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Break a Date down into calendar parts as observed in `timeZone`. */
export function getParts(date: Date, timeZone: string): DateParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) map[part.type] = part.value;
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0; // some engines emit "24" for midnight
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour,
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    weekday: WEEKDAY_INDEX[map.weekday] ?? 0,
  };
}

/** `YYYY-MM-DD` for the given instant in `timeZone` (defaults to now). */
export function getDateKey(timeZone: string, date: Date = new Date()): string {
  const p = getParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** `HH:mm` (24h) for the given instant in `timeZone` (defaults to now). */
export function getTimeKey(timeZone: string, date: Date = new Date()): string {
  const p = getParts(date, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** Minutes since midnight in `timeZone` for the given instant. */
export function getMinutesOfDay(timeZone: string, date: Date = new Date()): number {
  const p = getParts(date, timeZone);
  return p.hour * 60 + p.minute;
}

/** Convert an `HH:mm` string to minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

/** Convert minutes since midnight to an `HH:mm` string. */
export function minutesToTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Format an `HH:mm` string as a friendly 12h label, e.g. "2:00 PM". */
export function formatTime12(time: string): string {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
}

/**
 * A stable Date anchored at noon UTC for a `YYYY-MM-DD` key. Noon avoids any
 * DST/offset rounding when the value is only used for calendar arithmetic
 * (weekday, month grids, formatting) — never for timezone conversion.
 */
export function dateKeyToDate(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

/** `YYYY-MM-DD` for a noon-anchored Date (inverse of {@link dateKeyToDate}). */
export function dateToDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Add (or subtract) whole days to a `YYYY-MM-DD` key. */
export function addDaysKey(dateKey: string, days: number): string {
  const d = dateKeyToDate(dateKey);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToDateKey(d);
}

/** Day of week for a `YYYY-MM-DD` key: 0 (Sun) - 6 (Sat). */
export function weekdayOf(dateKey: string): number {
  return dateKeyToDate(dateKey).getUTCDay();
}

/** Inclusive list of `YYYY-MM-DD` keys between two keys. */
export function rangeKeys(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let cursor = startKey;
  // guard against runaway loops
  for (let i = 0; i < 5000 && cursor <= endKey; i++) {
    keys.push(cursor);
    cursor = addDaysKey(cursor, 1);
  }
  return keys;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** e.g. "July 2026" for a `YYYY-MM` or `YYYY-MM-DD` key. */
export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map((v) => parseInt(v, 10));
  return `${MONTHS[(m || 1) - 1]} ${y}`;
}

/** e.g. "Sat, Jul 25" for a `YYYY-MM-DD` key. */
export function formatDayLabel(dateKey: string): string {
  const d = dateKeyToDate(dateKey);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export { pad };
