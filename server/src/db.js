import mongoose from "mongoose";

/**
 * Serverless functions are frozen and thawed between requests, so a fresh
 * connection per invocation would exhaust the database's connection limit
 * fast. Cache the promise on globalThis, which survives warm starts.
 */
const cache = globalThis.__mongoose ?? { conn: null, promise: null };
globalThis.__mongoose = cache;

export default async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Keep the pool small: many concurrent lambdas each hold their own.
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m.connection);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Let the next request retry instead of caching a failed promise.
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
