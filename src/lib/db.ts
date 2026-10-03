import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

/** True when a MongoDB connection string is configured for this deployment. */
export const hasDatabase = () => Boolean(DATABASE_URL);

type ConnectionCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
    mongoose?: ConnectionCache;
};

const cached: ConnectionCache =
    globalWithMongoose.mongoose ?? (globalWithMongoose.mongoose = { conn: null, promise: null });

async function connectToDatabase() {
    if (!DATABASE_URL) {
        throw new Error("DATABASE_URL is not configured");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(DATABASE_URL, opts).then((instance) => instance);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;
