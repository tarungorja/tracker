import { connectToDatabase } from "@/lib/db";
import { SEED_MEDICATIONS } from "@/lib/constants";
import { normalizeScheduleLabel } from "@/lib/time";
import { Medication } from "@/models";

/**
 * Seed the medications collection **only if it is empty**. Safe to call on
 * every request — it early-returns once data exists.
 *
 * Returns the number of medications inserted (0 when already seeded).
 */
export async function seedMedicationsIfEmpty(): Promise<number> {
  await connectToDatabase();

  const existing = await Medication.estimatedDocumentCount();
  if (existing > 0) return 0;

  const docs = SEED_MEDICATIONS.map((med) => ({
    ...med,
    scheduleTimes: med.scheduleTimes.map(normalizeScheduleLabel),
    enabled: true,
  }));

  try {
    await Medication.insertMany(docs, { ordered: false });
  } catch {
    // A concurrent request may have seeded first; the unique name index makes
    // that a harmless duplicate-key error.
  }

  return docs.length;
}

/** Guard so `ensureSeeded` only actually hits the DB once per warm lambda. */
let seededThisRuntime = false;

export async function ensureSeeded(): Promise<void> {
  if (seededThisRuntime) return;
  try {
    await seedMedicationsIfEmpty();
    seededThisRuntime = true;
  } catch {
    // Leave the flag false so a later request retries after a transient error.
  }
}
