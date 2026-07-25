"use server";

import { revalidatePath } from "next/cache";
import { getSettings } from "@/lib/data/settings";
import { setDoseStatus, setDoseNote } from "@/lib/data/logs";
import { recordDoseOutcome } from "@/lib/reminders/record";
import { DOSE_INFO } from "@/lib/data/dose-info";
import { getDateKey } from "@/lib/time";
import type { ActionResult, DoseStatus, TimelineDose } from "@/types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/analytics");
  revalidatePath("/medications");
}

async function changeStatus(
  doseKey: string,
  status: DoseStatus,
  dateKey?: string,
): Promise<{ ok: boolean; message?: string; dose?: TimelineDose }> {
  if (!DOSE_INFO.has(doseKey)) {
    return { ok: false, message: "Unknown medication dose." };
  }
  try {
    const settings = await getSettings();
    const day = dateKey ?? getDateKey(settings.timezone);
    const dose = await setDoseStatus(day, doseKey, status);
    await recordDoseOutcome(day, doseKey, status);
    revalidateAll();
    return { ok: true, dose: dose ?? undefined };
  } catch (error) {
    console.error("changeStatus failed", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function completeDose(doseKey: string, dateKey?: string) {
  return changeStatus(doseKey, "completed", dateKey);
}

export async function skipDose(doseKey: string, dateKey?: string) {
  return changeStatus(doseKey, "skipped", dateKey);
}

/** Undo returns a dose to the pending state. */
export async function undoDose(doseKey: string, dateKey?: string) {
  return changeStatus(doseKey, "pending", dateKey);
}

export async function saveDoseNote(
  doseKey: string,
  notes: string,
  dateKey?: string,
): Promise<ActionResult> {
  if (!DOSE_INFO.has(doseKey)) {
    return { ok: false, message: "Unknown medication dose." };
  }
  try {
    const settings = await getSettings();
    const day = dateKey ?? getDateKey(settings.timezone);
    await setDoseNote(day, doseKey, notes);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("saveDoseNote failed", error);
    return { ok: false, message: "Could not save note." };
  }
}
