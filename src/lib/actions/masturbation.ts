"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { MasturbationLog } from "@/lib/models";
import { getSettings } from "@/lib/data/settings";
import { getDateKey } from "@/lib/time";
import type { ActionResult } from "@/types";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/masturbation");
  revalidatePath("/analytics");
  revalidatePath("/calendar");
}

async function today(): Promise<string> {
  const settings = await getSettings();
  return getDateKey(settings.timezone);
}

/** Increment today's count and record the event timestamp. Returns new count. */
export async function incrementMasturbation(): Promise<
  ActionResult & { count?: number }
> {
  try {
    await connectToDatabase();
    const dateKey = await today();
    const doc = await MasturbationLog.findOneAndUpdate(
      { dateKey },
      { $inc: { count: 1 }, $push: { events: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    revalidate();
    return { ok: true, count: doc?.count ?? 1 };
  } catch (error) {
    console.error("incrementMasturbation failed", error);
    return { ok: false, message: "Could not update count." };
  }
}

/** Decrement today's count (never below zero), popping the latest event. */
export async function decrementMasturbation(): Promise<
  ActionResult & { count?: number }
> {
  try {
    await connectToDatabase();
    const dateKey = await today();
    const doc = await MasturbationLog.findOne({ dateKey });
    if (!doc || doc.count <= 0) return { ok: true, count: 0 };
    doc.count = Math.max(0, doc.count - 1);
    if (doc.events.length) doc.events.pop();
    await doc.save();
    revalidate();
    return { ok: true, count: doc.count };
  } catch (error) {
    console.error("decrementMasturbation failed", error);
    return { ok: false, message: "Could not update count." };
  }
}

/** Reset today's count to zero. */
export async function resetMasturbationToday(): Promise<ActionResult> {
  try {
    await connectToDatabase();
    const dateKey = await today();
    await MasturbationLog.findOneAndUpdate(
      { dateKey },
      { $set: { count: 0, events: [] } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    revalidate();
    return { ok: true };
  } catch (error) {
    console.error("resetMasturbationToday failed", error);
    return { ok: false, message: "Could not reset count." };
  }
}

export async function saveMasturbationNote(notes: string): Promise<ActionResult> {
  try {
    await connectToDatabase();
    const dateKey = await today();
    await MasturbationLog.findOneAndUpdate(
      { dateKey },
      { $set: { notes: notes.slice(0, 500) } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    revalidate();
    return { ok: true };
  } catch (error) {
    console.error("saveMasturbationNote failed", error);
    return { ok: false, message: "Could not save note." };
  }
}
