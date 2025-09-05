// src/lib/server/db.ts
import { MongoClient, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';

// Global cache across hot reloads / serverless cold starts
const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
};

function required(name: string): string {
  const val = env[name];
  if (!val) throw new Error(`${name} environment variable is not set`);
  return val;
}

export async function getDb(): Promise<Db> {
  if (globalForMongo.mongoDb) return globalForMongo.mongoDb;

  const uri = required('MONGODB_URI');
  const dbName = required('MONGODB_DB');

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri, {
      // Optional: tune pool for serverless
      maxPoolSize: 5,
      minPoolSize: 0
    });
    await globalForMongo.mongoClient.connect();
    console.log('[mongo] connected new client');
  }

  globalForMongo.mongoDb = globalForMongo.mongoClient.db(dbName);
  console.log('[mongo] using db:', globalForMongo.mongoDb.databaseName);

  return globalForMongo.mongoDb;
}

export async function closeDb(): Promise<void> {
  if (process.env.NODE_ENV === 'development' && globalForMongo.mongoClient) {
    await globalForMongo.mongoClient.close();
    globalForMongo.mongoClient = undefined;
    globalForMongo.mongoDb = undefined;
    console.log('[mongo] connection closed');
  } else {
    console.log('[mongo] closeDb skipped (prod)');
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const d = await getDb();
    await d.admin().ping();
    console.log('[mongo] ping ok');
    return true;
  } catch (err) {
    console.error('[mongo] ping failed:', err);
    return false;
  }
}
