import mongoose from "mongoose";
import { promises as dnsPromises } from "dns";

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

/**
 * Some networks (VPNs, hotspot DNS interceptors) block SRV lookups from Node
 * while the system resolver works fine. Retry the SRV lookup against public
 * resolvers before giving up.
 */
async function resolveSrvHosts(
  host: string
): Promise<{ name: string; port: number }[] | null> {
  const attempts: Array<() => Promise<{ name: string; port: number }[]>> = [
    () => dnsPromises.resolveSrv(`_mongodb._tcp.${host}`),
    () => {
      const resolver = new dnsPromises.Resolver();
      resolver.setServers(["8.8.8.8", "1.1.1.1"]);
      return resolver.resolveSrv(`_mongodb._tcp.${host}`);
    },
    () => {
      const resolver = new dnsPromises.Resolver();
      resolver.setServers(["1.1.1.1", "8.8.8.8"]);
      return resolver.resolveSrv(`_mongodb._tcp.${host}`);
    },
  ];

  for (const attempt of attempts) {
    try {
      const records = await attempt();
      if (records.length > 0) return records;
    } catch {
      // try the next resolver
    }
  }
  return null;
}

/**
 * Convert `mongodb+srv://` URIs to a direct `mongodb://` connection string
 * using manually resolved SRV records. Only used as a fallback when the
 * standard SRV connect fails.
 */
export async function connectWithFallback(uri: string): Promise<typeof mongoose> {
  try {
    return await mongoose.connect(uri);
  } catch (err) {
    if (!uri.startsWith("mongodb+srv://")) throw err;

    const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/]+)(\/.*)?$/);
    if (!match) throw err;

    const [, auth, srvHost, rest = ""] = match;
    const hosts = await resolveSrvHosts(srvHost);
    if (!hosts) throw err;

    const directHosts = hosts.map((h) => `${h.name}:${h.port || 27017}`).join(",");
    const extraParams = "ssl=true&authSource=admin";
    const separator = rest.includes("?") ? "&" : "?";
    const directUri = `mongodb://${auth}@${directHosts}${rest}${separator}${extraParams}`;

    return mongoose.connect(directUri);
  }
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not defined");
  }

  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = connectWithFallback(MONGODB_URI);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
