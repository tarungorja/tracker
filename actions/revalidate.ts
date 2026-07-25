import { revalidatePath } from "next/cache";

/** Paths whose Server Components read medication / dose data. */
const MED_PATHS = ["/", "/today", "/medications", "/statistics"];
/** Wellness shows on its own page and embedded on the dashboard. */
const WELLNESS_PATHS = ["/wellness", "/"];

export function revalidateMedicationViews(): void {
  for (const path of MED_PATHS) revalidatePath(path);
}

export function revalidateWellnessViews(): void {
  for (const path of WELLNESS_PATHS) revalidatePath(path);
}
