/**
 * Time helpers.
 *
 * The whole app operates on **Indian Standard Time (Asia/Kolkata, UTC+05:30,
 * no DST)**. Schedule times, "today", streaks and the cron window are all
 * computed in IST regardless of where the server runs. We avoid pulling in a
 * timezone library by leaning on `Intl.DateTimeFormat`.
 */

export const IST_TIMEZONE = "Asia/Kolkata";

/** IST is a fixed offset: +5h30m = 330 minutes. */
const IST_OFFSET_MINUTES = 5 * 60 + 30;

/** Parts of a date rendered in IST. */
export interface ISTParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  second: number;
  weekday: number; // 0 (Sun) - 6 (Sat)
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

/** Break a `Date` (or now) into its IST calendar/clock parts. */
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

/** Current IST date as an ISO day string, e.g. "2026-07-25". */
export function istDateKey(date: Date = new Date()): string {
  const { year, month, day } = getISTParts(date);
  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

/** Minutes elapsed since midnight IST for the given instant. */
export function istMinutesOfDay(date: Date = new Date()): number {
  const { hour, minute } = getISTParts(date);
  return hour * 60 + minute;
}

/**
 * Parse a human schedule label ("2:00 PM", "10:00 AM", "9:00 PM") into minutes
 * since midnight. Returns `null` for anything unparseable.
 */
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

/** Convert minutes-since-midnight back to a "2:00 PM" style label. */
export function minutesToLabel(minutes: number): string {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${meridiem}`;
}

/** Normalise a schedule label to a canonical form, e.g. "2:00 pm" -> "2:00 PM". */
export function normalizeScheduleLabel(label: string): string {
  const minutes = parseScheduleToMinutes(label);
  return minutes === null ? label.trim() : minutesToLabel(minutes);
}

/** A friendly, human clock string for "now" in IST, e.g. "2:05 PM". */
export function istClockLabel(date: Date = new Date()): string {
  return istMinutesOfDay(date) >= 0 ? minutesToLabel(istMinutesOfDay(date)) : "";
}

/** Full IST timestamp label, e.g. "Fri, 25 Jul 2026 · 2:05 PM". */
export function istTimestampLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date) + " · " + istClockLabel(date);
}

/**
 * Build a `Date` (UTC instant) that corresponds to midnight IST of the given
 * day key. Useful for storing/deriving date ranges deterministically.
 */
export function istDateKeyToUTC(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  // midnight IST == previous day 18:30 UTC
  const utcMillis = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 0, 0, 0) -
    IST_OFFSET_MINUTES * 60_000;
  return new Date(utcMillis);
}

/** Add (or subtract) days to an ISO day key, staying in IST. */
export function addDaysToKey(dateKey: string, days: number): string {
  const base = istDateKeyToUTC(dateKey).getTime();
  return istDateKey(new Date(base + days * 86_400_000));
}

/** Inclusive list of day keys between two keys (ascending). */
export function dateKeyRange(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let cursor = startKey;
  // guard against runaway loops
  for (let i = 0; i < 4000 && cursor <= endKey; i++) {
    keys.push(cursor);
    cursor = addDaysToKey(cursor, 1);
  }
  return keys;
}

/** Difference in whole days between two day keys (endKey - startKey). */
export function daysBetweenKeys(startKey: string, endKey: string): number {
  const a = istDateKeyToUTC(startKey).getTime();
  const b = istDateKeyToUTC(endKey).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Weekday index (0 Sun … 6 Sat) for a day key. */
export function weekdayOfKey(dateKey: string): number {
  return getISTParts(istDateKeyToUTC(dateKey)).weekday;
}

/** Short label for a day key, e.g. "Jul 25". */
export function shortDateLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(istDateKeyToUTC(dateKey));
}
