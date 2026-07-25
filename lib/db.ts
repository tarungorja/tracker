import mongoose, { type Mongoose } from "mongoose";

import { env } from "@/lib/env";

/**
 * Reusable MongoDB connection.
 *
 * In a serverless environment (Vercel) every invocation may run in a fresh
 * module context, but warm lambdas reuse the same global. We cache the
 * connection promise on `globalThis` so concurrent requests share a single
 * pooled connection instead of opening a new one per request.
 */

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache =
  globalThis._mongooseCache ?? (globalThis._mongooseCache = { conn: null, promise: null });

export async function connectToDatabase(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      // Keep the pool small — Vercel functions are short-lived and Atlas free
      // tier caps concurrent connections.
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Reset so the next request can retry instead of reusing a rejected promise.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
