/**
 * CLI seed script — run with `npm run seed`.
 *
 * Loads environment variables from `.env.local` (no dependency required) and
 * inserts the preloaded medications if the collection is empty.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      // Strip surrounding quotes.
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env.local — assume variables are already present in the environment.
  }
}

async function main() {
  loadEnvLocal();

  if (!process.env.MONGODB_URI) {
    console.error("✗ MONGODB_URI is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const { seedMedicationsIfEmpty } = await import("../lib/seed");
  const inserted = await seedMedicationsIfEmpty();

  if (inserted > 0) {
    console.log(`✓ Seeded ${inserted} medications.`);
  } else {
    console.log("✓ Medications already present — nothing to seed.");
  }
  process.exit(0);
}

main().catch((error) => {
  console.error("✗ Seed failed:", error);
  process.exit(1);
});
