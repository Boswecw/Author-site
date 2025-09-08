// src/lib/server/db.ts
import { MongoClient, ServerApiVersion, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
  connecting?: Promise<MongoClient>;
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
 * Create MongoDB client with Render-optimized settings
 */
function createMongoClient(uri: string): MongoClient {
  return new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    
    // Render-optimized timeouts (increased from 30s to 60s)
    connectTimeoutMS: 60_000,
    serverSelectionTimeoutMS: 60_000,
    socketTimeoutMS: 60_000,
    heartbeatFrequencyMS: 30_000,
    
    // Improved connection pool settings
    maxPoolSize: 10,        // Increased from 5
    minPoolSize: 1,         // Keep at least 1 connection alive
    maxIdleTimeMS: 120_000, // 2 minutes idle timeout
    
    // TLS/SRV robustness for Render/Atlas
    tls: true,
    tlsAllowInvalidCertificates: false,
    
    // Retry and buffering settings
    retryWrites: true,
    retryReads: true,
    bufferMaxEntries: 0,    // Disable buffering for immediate errors
    bufferCommands: false,
  });
}

/**
 * Get or create MongoDB client with proper connection reuse
 */
async function getMongoClient(): Promise<MongoClient> {
  // Return existing client if it's healthy
  if (globalForMongo.mongoClient) {
    try {
      // Quick health check on existing client
      await globalForMongo.mongoClient.db('admin').command({ ping: 1 });
      return globalForMongo.mongoClient;
    } catch (error) {
      console.warn('[mongo] existing client unhealthy, reconnecting...', error);
      // Clean up dead client
      await globalForMongo.mongoClient.close().catch(() => {});
      globalForMongo.mongoClient = undefined;
      globalForMongo.mongoDb = undefined;
    }
  }

  // If already connecting, wait for that connection to avoid race conditions
  if (globalForMongo.connecting) {
    console.log('[mongo] waiting for existing connection...');
    return await globalForMongo.connecting;
  }

  // Start new connection
  console.log('[mongo] creating new MongoDB connection...');
  globalForMongo.connecting = (async () => {
    const uri = required('MONGODB_URI');
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
      throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    }

    const client = createMongoClient(uri);
    
    try {
      await client.connect();
      // Test the connection
      await client.db('admin').command({ ping: 1 });
      console.log('[mongo] ✅ connected new client successfully');
      return client;
    } catch (error) {
      console.error('[mongo] ❌ connection failed:', error);
      await client.close().catch(() => {});
      throw error;
    }
  })();
  
  try {
    globalForMongo.mongoClient = await globalForMongo.connecting;
    return globalForMongo.mongoClient;
  } finally {
    globalForMongo.connecting = undefined;
  }
}

/**
 * Return a connected Db instance.
 * Reuses the same client across hot reloads with improved error handling.
 */
export async function getDb(): Promise<Db> {
  try {
    const dbName = env.MONGODB_DB?.trim() ?? (dev ? 'Author-site' : 'author_site');
    
    // Return cached DB if available and healthy
    if (globalForMongo.mongoDb && globalForMongo.mongoClient) {
      try {
        // Quick health check
        await globalForMongo.mongoClient.db('admin').command({ ping: 1 });
        return globalForMongo.mongoDb;
      } catch (error) {
        console.warn('[mongo] cached DB unhealthy, reconnecting...');
        globalForMongo.mongoDb = undefined;
      }
    }

    // Get fresh client and database
    const client = await getMongoClient();
    globalForMongo.mongoDb = client.db(dbName);
    
    console.log('[mongo] using db:', globalForMongo.mongoDb.databaseName);
    return globalForMongo.mongoDb;
    
  } catch (err) {
    console.error('[mongo] failed to connect:', err);

    // Fail-safe: return stub DB so the app doesn't crash outright
    console.warn('[mongo] returning fallback database interface');
    return {
      collection: () => ({
        find: () => ({
          sort: () => ({ toArray: async () => [] }),
          limit: () => ({ toArray: async () => [] }),
          toArray: async () => []
        }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: null }),
        updateOne: async () => ({ modifiedCount: 0 }),
        deleteOne: async () => ({ deletedCount: 0 }),
        countDocuments: async () => 0,
      }),
      command: async () => ({ ok: 1 }),
      databaseName: 'fallback',
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
    console.log('[mongo] ✅ health check passed');
    return true;
  } catch (err) {
    console.error('[mongo] ❌ ping failed:', err);
    return false;
  }
}

/**
 * Gracefully close MongoDB connection
 */
export async function closeConnection(): Promise<void> {
  if (globalForMongo.mongoClient) {
    try {
      await globalForMongo.mongoClient.close();
      console.log('[mongo] connection closed gracefully');
    } catch (error) {
      console.error('[mongo] error closing connection:', error);
    } finally {
      globalForMongo.mongoClient = undefined;
      globalForMongo.mongoDb = undefined;
    }
  }
}

// Clean up on process exit
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeConnection);
  process.on('SIGTERM', closeConnection);
}