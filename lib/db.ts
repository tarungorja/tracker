import mongoose, { type Mongoose } from 'mongoose';

const MONGODB_URI = 'mongodb+srv://tarungorja:Gtarun%402002@cluster0.d56wetf.mongodb.net/';

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

declare global {
    var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis._mongooseCache ?? (globalThis._mongooseCache = { conn: null, promise: null });

export async function connectToDatabase(): Promise<Mongoose> {
    if (cache.conn) return cache.conn;

    if (!cache.promise) {
        mongoose.set('strictQuery', true);
        cache.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 10_000,
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

