/**
 * One-off migration for per-user data. Run once per environment:
 *   npm run migrate:auth          (uses .env.development)
 *
 * Drops the old globally-unique indexes (they would block a second user's data)
 * and builds the new per-user ones.
 */
import mongoose from "mongoose";

import { DailyLog, Medication, Otp, Session, User } from "../models";

async function dropIndexIfExists(model: { collection: mongoose.Collection }, name: string) {
  try {
    await model.collection.dropIndex(name);
    console.log(`Dropped index ${model.collection.collectionName}.${name}`);
  } catch (error) {
    const code = (error as { codeName?: string }).codeName;
    if (code === "IndexNotFound" || code === "NamespaceNotFound") {
      console.log(`Index ${model.collection.collectionName}.${name} not present, skipping`);
      return;
    }
    throw error;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);

  await dropIndexIfExists(Medication, "name_1");
  await dropIndexIfExists(DailyLog, "date_1_medicationName_1_scheduledTime_1");

  for (const model of [User, Otp, Session, Medication, DailyLog]) {
    await model.syncIndexes();
    console.log(`Synced indexes for ${model.modelName}`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
