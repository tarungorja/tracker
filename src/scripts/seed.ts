import "./load-env";

import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import {
  Settings,
  Medication,
  DailyLog,
  MasturbationLog,
} from "@/lib/models";
import { MEDICATIONS, ALL_DOSES } from "@/lib/constants";
import { DEFAULT_TIMEZONE, getDateKey, addDaysKey, timeToMinutes } from "@/lib/time";
import type { DoseStatus } from "@/types";

const DEMO_DAYS = 21;

function weightedStatus(): DoseStatus {
  const r = Math.random();
  if (r < 0.8) return "completed";
  if (r < 0.9) return "skipped";
  return "missed";
}

async function seedSettings() {
  await Settings.findOneAndUpdate(
    { key: "singleton" },
    {
      $setOnInsert: { key: "singleton" },
      $set: {
        email: process.env.USER_EMAIL || "",
        timezone: process.env.SEED_TIMEZONE || DEFAULT_TIMEZONE,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log("✓ Settings ready");
}

async function seedMedications() {
  for (const med of MEDICATIONS) {
    await Medication.findOneAndUpdate(
      { slug: med.slug },
      {
        $set: {
          slug: med.slug,
          name: med.name,
          emoji: med.emoji,
          color: med.color,
          summary: med.summary,
          order: med.order,
          active: true,
          doses: med.doses.map((d) => ({
            key: d.key,
            label: d.label,
            slot: d.slot,
            time: d.time,
            instructions: d.instructions,
            warnings: d.warnings ?? [],
          })),
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log(`✓ Seeded ${MEDICATIONS.length} medications`);
}

async function ensureTodayLogs(timezone: string) {
  const todayKey = getDateKey(timezone);
  const ops = ALL_DOSES.map((dose) => ({
    updateOne: {
      filter: { dateKey: todayKey, doseKey: dose.key },
      update: {
        $setOnInsert: {
          dateKey: todayKey,
          doseKey: dose.key,
          medicationSlug: dose.medication.slug,
          medicationName: dose.medication.name,
          emoji: dose.medication.emoji,
          color: dose.medication.color,
          doseLabel: dose.label,
          slot: dose.slot,
          scheduledTime: dose.time,
          status: "pending" as const,
        },
      },
      upsert: true,
    },
  }));
  await DailyLog.bulkWrite(ops, { ordered: false });
  console.log(`✓ Ensured today's doses (${todayKey})`);
}

async function seedDemoHistory(timezone: string) {
  const todayKey = getDateKey(timezone);
  const logOps = [];
  const mastOps = [];

  for (let i = 1; i <= DEMO_DAYS; i++) {
    const dateKey = addDaysKey(todayKey, -i);

    for (const dose of ALL_DOSES) {
      const status = weightedStatus();
      const scheduledMin = timeToMinutes(dose.time);
      const completedAt =
        status === "completed"
          ? new Date(
              `${dateKey}T${String(Math.floor((scheduledMin + Math.floor(Math.random() * 40)) / 60)).padStart(2, "0")}:00:00Z`,
            )
          : null;
      logOps.push({
        updateOne: {
          filter: { dateKey, doseKey: dose.key },
          update: {
            $set: {
              status,
              completedAt,
              skippedAt: status === "skipped" ? new Date(`${dateKey}T12:00:00Z`) : null,
              missedAt: status === "missed" ? new Date(`${dateKey}T23:00:00Z`) : null,
            },
            $setOnInsert: {
              dateKey,
              doseKey: dose.key,
              medicationSlug: dose.medication.slug,
              medicationName: dose.medication.name,
              emoji: dose.medication.emoji,
              color: dose.medication.color,
              doseLabel: dose.label,
              slot: dose.slot,
              scheduledTime: dose.time,
            },
          },
          upsert: true,
        },
      });
    }

    // Random wellness activity (mostly 0, sometimes 1-2).
    const count = Math.random() < 0.4 ? Math.floor(Math.random() * 3) : 0;
    if (count > 0) {
      mastOps.push({
        updateOne: {
          filter: { dateKey },
          update: {
            $set: {
              count,
              events: Array.from(
                { length: count },
                () => new Date(`${dateKey}T22:00:00Z`),
              ),
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (logOps.length) await DailyLog.bulkWrite(logOps, { ordered: false });
  if (mastOps.length) {
    // Cast: the `$set.events` Date[] doesn't line up with Mongoose's
    // DocumentArray type in bulkWrite, but is correct at runtime.
    await MasturbationLog.bulkWrite(
      mastOps as unknown as Parameters<typeof MasturbationLog.bulkWrite>[0],
      { ordered: false },
    );
  }
  console.log(`✓ Seeded ${DEMO_DAYS} days of demo history`);
}

async function main() {
  const demo = !process.argv.includes("--no-demo");
  await connectToDatabase();
  console.log("→ Connected to MongoDB");

  await seedSettings();
  await seedMedications();

  const settings = await Settings.findOne({ key: "singleton" }).lean();
  const timezone = settings?.timezone || DEFAULT_TIMEZONE;

  await ensureTodayLogs(timezone);
  if (demo) await seedDemoHistory(timezone);
  else console.log("• Skipping demo history (--no-demo)");

  console.log("\n✅ Seed complete.\n");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("\n❌ Seed failed:", error?.message ?? error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
