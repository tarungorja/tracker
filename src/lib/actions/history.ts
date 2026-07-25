"use server";

import { getDayHistory, type DayHistory } from "@/lib/data/calendar";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Client-callable wrapper to load a single day's history for the dialog. */
export async function fetchDayHistory(dateKey: string): Promise<DayHistory> {
  if (!DATE_RE.test(dateKey)) {
    return { dateKey, doses: [], masturbationCount: 0 };
  }
  return getDayHistory(dateKey);
}
