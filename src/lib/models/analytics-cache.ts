import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Optional cache for expensive aggregate computations. Entries expire via a
 * TTL index on `expiresAt`, so stale analytics are recomputed automatically.
 */
const AnalyticsCacheSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
    computedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { collection: "analytics_cache" },
);

// TTL index: documents are removed once `expiresAt` passes.
AnalyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AnalyticsCacheDoc = InferSchemaType<typeof AnalyticsCacheSchema>;

export const AnalyticsCache: Model<AnalyticsCacheDoc> =
  (mongoose.models.AnalyticsCache as Model<AnalyticsCacheDoc>) ||
  mongoose.model<AnalyticsCacheDoc>("AnalyticsCache", AnalyticsCacheSchema);
