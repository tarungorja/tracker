import { revalidatePath } from "next/cache";

const MED_PATHS = ["/", "/today", "/medications", "/statistics"];

const WELLNESS_PATHS = ["/wellness", "/"];

export function revalidateMedicationViews(): void {
  for (const path of MED_PATHS) revalidatePath(path);
}

export function revalidateWellnessViews(): void {
  for (const path of WELLNESS_PATHS) revalidatePath(path);
}
