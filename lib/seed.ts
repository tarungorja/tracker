import { connectToDatabase } from "@/lib/db";
import { SEED_MEDICATIONS } from "@/lib/constants";
import { normalizeScheduleLabel } from "@/lib/time";
import { Medication } from "@/models";

export async function seedMedicationsIfEmpty(): Promise<number> {
  await connectToDatabase();

  const existing = await Medication.estimatedDocumentCount();
  if (existing > 0) return 0;

  const docs = SEED_MEDICATIONS.map((med) => ({
    ...med,
    scheduleTimes: med.scheduleTimes.map(normalizeScheduleLabel),
    intervalDays: med.intervalDays ?? 1,
    enabled: true,
  }));

  try {
    await Medication.insertMany(docs, { ordered: false });
  } catch {}

  return docs.length;
}

let seededThisRuntime = false;

export async function ensureSeeded(): Promise<void> {
  if (seededThisRuntime) return;
  try {
    await seedMedicationsIfEmpty();
    seededThisRuntime = true;
  } catch {}
}
