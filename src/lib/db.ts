import mongoose from "mongoose";
import { env } from "./env";

/**
 * Cached Mongoose connection.
 *
 * Next.js clears the module cache on every hot reload in development, which
 * would otherwise open a brand new connection on each request and exhaust the
 * MongoDB connection pool. We stash the connection promise on `globalThis`.
 */

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  _mongoose?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose._mongoose ?? { conn: null, promise: null };

globalForMongoose._mongoose = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file (see .env.example).",
    );
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
