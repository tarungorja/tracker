"use server";

import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { normalizeScheduleLabel } from "@/lib/time";
import { Medication } from "@/models";
import { revalidateMedicationViews } from "@/actions/revalidate";
import type { ActionResult } from "@/actions/logs";

const toggleSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
});

/** Enable or disable reminders for a medication. */
export async function setMedicationEnabled(
  input: z.infer<typeof toggleSchema>,
): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid medication." };

  try {
    await connectToDatabase();
    await Medication.updateOne(
      { _id: parsed.data.id },
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
  scheduleTimes: z.array(z.string().min(1)).min(1, "Add at least one time."),
});

/** Create a new medication or update an existing one. */
export async function upsertMedication(
  input: z.infer<typeof upsertSchema>,
): Promise<ActionResult> {
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const { id, name, description, instructions, scheduleTimes } = parsed.data;
  const normalizedTimes = Array.from(
    new Set(scheduleTimes.map(normalizeScheduleLabel)),
  );

  try {
    await connectToDatabase();
    if (id) {
      await Medication.updateOne(
        { _id: id },
        {
          $set: {
            name,
            description: description ?? "",
            instructions: instructions ?? "",
            scheduleTimes: normalizedTimes,
          },
        },
      );
    } else {
      await Medication.create({
        name,
        description: description ?? "",
        instructions: instructions ?? "",
        scheduleTimes: normalizedTimes,
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

/** Permanently remove a medication. */
export async function deleteMedication(
  input: z.infer<typeof deleteSchema>,
): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid medication." };

  try {
    await connectToDatabase();
    await Medication.deleteOne({ _id: parsed.data.id });
    revalidateMedicationViews();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not delete medication.",
    };
  }
}
