"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/lib/models";
import { settingsSchema, type SettingsInput } from "@/lib/validation/settings";
import type { ActionResult } from "@/types";

export type { SettingsInput };

export async function updateSettings(
  input: SettingsInput,
): Promise<ActionResult & { fieldErrors?: Record<string, string> }> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await connectToDatabase();
    await Settings.findOneAndUpdate(
      { key: "singleton" },
      { $set: parsed.data },
      { upsert: true, setDefaultsOnInsert: true },
    );
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    console.error("updateSettings failed", error);
    return { ok: false, message: "Could not save settings." };
  }
}
