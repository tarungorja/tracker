"use server";

import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { istDateKey } from "@/lib/time";
import { WELLNESS_LOG_KEY } from "@/lib/constants";
import { DailyLog } from "@/models";
import { revalidateWellnessViews } from "@/actions/revalidate";
import type { ActionResult } from "@/actions/logs";

export interface CountResult extends ActionResult {
  count?: number;
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();

/** The (medicationName, scheduledTime) sentinel identifying the wellness row. */
function wellnessKey(day: string) {
  return { date: day, medicationName: WELLNESS_LOG_KEY, scheduledTime: WELLNESS_LOG_KEY };
}

/** Adjust today's count by a delta, clamped at zero. Returns the new count. */
async function adjustCount(delta: number, date?: string): Promise<CountResult> {
  const day = date ?? istDateKey();
  try {
    await connectToDatabase();
    const key = wellnessKey(day);
    const existing = await DailyLog.findOne(key);
    const nextCount = Math.max(0, (existing?.count ?? 0) + delta);

    await DailyLog.updateOne(
      key,
      { $set: { count: nextCount }, $setOnInsert: key },
      { upsert: true },
    );
    revalidateWellnessViews();
    return { ok: true, count: nextCount };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update count.",
    };
  }
}

export async function incrementCount(date?: string): Promise<CountResult> {
  if (!dateSchema.safeParse(date).success) return { ok: false, error: "Invalid date." };
  return adjustCount(1, date);
}

export async function decrementCount(date?: string): Promise<CountResult> {
  if (!dateSchema.safeParse(date).success) return { ok: false, error: "Invalid date." };
  return adjustCount(-1, date);
}

export async function resetCount(date?: string): Promise<CountResult> {
  if (!dateSchema.safeParse(date).success) return { ok: false, error: "Invalid date." };
  const day = date ?? istDateKey();
  try {
    await connectToDatabase();
    const key = wellnessKey(day);
    await DailyLog.updateOne(
      key,
      { $set: { count: 0 }, $setOnInsert: key },
      { upsert: true },
    );
    revalidateWellnessViews();
    return { ok: true, count: 0 };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not reset count.",
    };
  }
}

const notesSchema = z.object({
  notes: z.string().max(1000),
  date: dateSchema,
});

export async function setDayNotes(input: z.infer<typeof notesSchema>): Promise<ActionResult> {
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid note." };
  const day = parsed.data.date ?? istDateKey();

  try {
    await connectToDatabase();
    const key = wellnessKey(day);
    await DailyLog.updateOne(
      key,
      { $set: { notes: parsed.data.notes }, $setOnInsert: key },
      { upsert: true },
    );
    revalidateWellnessViews();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save note.",
    };
  }
}
