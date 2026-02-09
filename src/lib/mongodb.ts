import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not defined");
}

declare global{
    var mongooseConn:
    |{
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
    | undefined;
}

let cached = globalThis.mongooseConn;
if (!cached) {
  cached = globalThis.mongooseConn = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI as string);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
