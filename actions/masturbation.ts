"use server";

import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { istDateKey } from "@/lib/time";
import { MasturbationLog } from "@/models";
import { revalidateWellnessViews } from "@/actions/revalidate";
import type { ActionResult } from "@/actions/logs";

export interface CountResult extends ActionResult {
  count?: number;
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();

/** Adjust today's count by a delta, clamped at zero. Returns the new count. */
async function adjustCount(delta: number, date?: string): Promise<CountResult> {
  const day = date ?? istDateKey();
  try {
    await connectToDatabase();
    const existing = await MasturbationLog.findOne({ date: day });
    const nextCount = Math.max(0, (existing?.count ?? 0) + delta);

    await MasturbationLog.updateOne(
      { date: day },
      { $set: { count: nextCount }, $setOnInsert: { date: day } },
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
    await MasturbationLog.updateOne(
      { date: day },
      { $set: { count: 0 }, $setOnInsert: { date: day } },
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
    await MasturbationLog.updateOne(
      { date: day },
      { $set: { notes: parsed.data.notes }, $setOnInsert: { date: day } },
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
