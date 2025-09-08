// src/lib/server/db.ts
import { MongoClient, ServerApiVersion, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
};

/**
 * Get a required env var or throw.
 * Trims whitespace to avoid issues on Render.
 */
function required(name: string): string {
  const raw = env[name];
  if (!raw) throw new Error(`${name} environment variable is not set`);
  const val = raw.trim();
  if (!val) throw new Error(`${name} is empty`);
  return val;
}

/**
 * Return a connected Db instance.
 * Reuses the same client across hot reloads.
 */
export async function getDb(): Promise<Db> {
  if (globalForMongo.mongoDb) return globalForMongo.mongoDb;

  try {
    const uri = required('MONGODB_URI');
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
      throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    }

    const dbName =
      env.MONGODB_DB?.trim() ?? (dev ? 'Author-site' : undefined) ?? required('MONGODB_DB');

    if (!globalForMongo.mongoClient) {
      globalForMongo.mongoClient = new MongoClient(uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
        maxPoolSize: 5,
        minPoolSize: 0
      });
      await globalForMongo.mongoClient.connect();
      console.log('[mongo] connected new client');
    }

    globalForMongo.mongoDb = globalForMongo.mongoClient.db(dbName);
    console.log('[mongo] using db:', globalForMongo.mongoDb.databaseName);

    return globalForMongo.mongoDb;
  } catch (err) {
    console.error('[mongo] failed to connect:', err);

    // Fail-safe: return stub DB so the app doesn’t crash outright
    return {
      collection: () => ({
        find: () => ({
          sort: () => ({ toArray: async () => [] }),
          toArray: async () => []
        }),
        findOne: async () => null
      })
    } as unknown as Db;
  }
}

/**
 * Lightweight health check that pings the DB.
 * Returns true on success, false on failure.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch (err) {
    console.error('[mongo] ping failed:', err);
    return false;
  }
}
