"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { normalizeScheduleLabel, parseScheduleToMinutes } from "@/lib/time";
import { Medication } from "@/models";
import { revalidateMedicationViews } from "@/actions/revalidate";
import type { ActionResult } from "@/actions/logs";

const toggleSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
});

export async function setMedicationEnabled(
  input: z.infer<typeof toggleSchema>,
): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid medication." };
  const user = await requireUser();

  try {
    await connectToDatabase();
    await Medication.updateOne(
      { _id: parsed.data.id, userId: user.id },
      { $set: { enabled: parsed.data.enabled } },
    );
    revalidateMedicationViews();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update medication.",
    };
  }
}

const upsertSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1, "Name is required.").max(120),
  description: z.string().max(300).optional(),
  instructions: z.string().max(2000).optional(),
  scheduleTimes: z
    .array(
      z.string().refine((t) => parseScheduleToMinutes(t) !== null, "Enter a valid time."),
    )
    .min(1, "Add at least one time."),
  daysOfWeek: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Pick at least one day of the week.")
    .max(7),
});

export async function upsertMedication(
  input: z.infer<typeof upsertSchema>,
): Promise<ActionResult> {
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const user = await requireUser();
  const { id, name, description, instructions, scheduleTimes } = parsed.data;
  const daysOfWeek = Array.from(new Set(parsed.data.daysOfWeek)).sort((a, b) => a - b);
  const normalizedTimes = Array.from(
    new Set(scheduleTimes.map(normalizeScheduleLabel)),
  );

  try {
    await connectToDatabase();
    if (id) {
      await Medication.updateOne(
        { _id: id, userId: user.id },
        {
          $set: {
            name,
            description: description ?? "",
            instructions: instructions ?? "",
            scheduleTimes: normalizedTimes,
            daysOfWeek,
          },
        },
      );
    } else {
      await Medication.create({
        userId: user.id,
        name,
        description: description ?? "",
        instructions: instructions ?? "",
        scheduleTimes: normalizedTimes,
        daysOfWeek,
        enabled: true,
      });
    }
    revalidateMedicationViews();
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return { ok: false, error: "A medication with that name already exists." };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save medication.",
    };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteMedication(
  input: z.infer<typeof deleteSchema>,
): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid medication." };
  const user = await requireUser();

  try {
    await connectToDatabase();
    await Medication.deleteOne({ _id: parsed.data.id, userId: user.id });
    revalidateMedicationViews();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not delete medication.",
    };
  }
}
