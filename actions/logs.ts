"use server";

import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { istDateKey, normalizeScheduleLabel } from "@/lib/time";
import { DailyLog } from "@/models";
import { revalidateMedicationViews } from "@/actions/revalidate";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const doseSchema = z.object({
  medicationName: z.string().min(1),
  scheduledTime: z.string().min(1),
  completed: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function setDoseCompletion(
  input: z.infer<typeof doseSchema>,
): Promise<ActionResult> {
  const parsed = doseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid dose data." };

  const { medicationName, completed } = parsed.data;
  const scheduledTime = normalizeScheduleLabel(parsed.data.scheduledTime);
  const date = parsed.data.date ?? istDateKey();

  try {
    await connectToDatabase();
    await DailyLog.updateOne(
      { date, medicationName, scheduledTime },
      {
        $set: {
          completed,
          completedAt: completed ? new Date() : null,
        },
        $setOnInsert: { date, medicationName, scheduledTime },
      },
      { upsert: true },
    );
    revalidateMedicationViews();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update dose.",
    };
  }
}

const notesSchema = z.object({
  medicationName: z.string().min(1),
  scheduledTime: z.string().min(1),
  notes: z.string().max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function setDoseNotes(
  input: z.infer<typeof notesSchema>,
): Promise<ActionResult> {
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid note." };

  const { medicationName, notes } = parsed.data;
  const scheduledTime = normalizeScheduleLabel(parsed.data.scheduledTime);
  const date = parsed.data.date ?? istDateKey();

  try {
    await connectToDatabase();
    await DailyLog.updateOne(
      { date, medicationName, scheduledTime },
      { $set: { notes }, $setOnInsert: { date, medicationName, scheduledTime } },
      { upsert: true },
    );
    revalidateMedicationViews();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save note.",
    };
  }
}
