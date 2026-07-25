import { revalidatePath } from "next/cache";

/** Paths whose Server Components read medication / dose data. */
const MED_PATHS = ["/", "/today", "/medications", "/statistics"];
const WELLNESS_PATHS = ["/masturbation"];

export function revalidateMedicationViews(): void {
  for (const path of MED_PATHS) revalidatePath(path);
}

export function revalidateWellnessViews(): void {
  for (const path of WELLNESS_PATHS) revalidatePath(path);
}
