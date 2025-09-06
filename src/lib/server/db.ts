// src/lib/server/db.ts
import { MongoClient, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
};

/**
 * Get a required env var or throw.
 */
function required(name: string): string {
  const val = env[name];
  if (!val) throw new Error(`${name} environment variable is not set`);
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
    // 👇 use the DB name exactly as provided (hyphens allowed!)
    const dbName =
      env.MONGODB_DB ?? (dev ? 'Author-site' : undefined) ?? required('MONGODB_DB');

    if (!globalForMongo.mongoClient) {
      globalForMongo.mongoClient = new MongoClient(uri, {
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

    // Fail-safe: return stub DB so app doesn’t crash
    return {
      collection: () => ({
        find: () => ({ toArray: async () => [] }),
        findOne: async () => null
      })
    } as unknown as Db;
  }
}
