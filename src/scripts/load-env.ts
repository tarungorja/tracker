/**
 * Loads environment variables from `.env.local` then `.env` for standalone
 * scripts (Next.js does this automatically for the app, but the seed script
 * runs outside the framework). Imported first so `process.env` is populated
 * before any module reads it.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadFile(file: string) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf-8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadFile(".env.local");
loadFile(".env");
