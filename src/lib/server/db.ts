// src/lib/server/db.ts - FIXED VERSION

import { MongoClient, ServerApiVersion } from 'mongodb';
import type { Db } from 'mongodb';
import { dev } from '$app/environment';

// Global connection management
const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
  connecting?: Promise<MongoClient>;
};

let mockDbInUse = false;

export function isMockDbInUse(): boolean {
  return mockDbInUse;
}

function required(name: string): string {
  const raw = process.env[name];
  if (!raw) throw new Error(`${name} environment variable is not set`);
  const val = raw.trim();
  if (!val) throw new Error(`${name} is empty`);
  return val;
}

// ✅ FIXED: Remove invalid checkServerIdentity option
function createMongoClient(uri: string): MongoClient {
  console.log('[mongo] Creating client for Atlas cluster...');
  
  return new MongoClient(uri, {
    serverApi: { 
      version: ServerApiVersion.v1, 
      strict: true, 
      deprecationErrors: true 
    },
    connectTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 15_000,
    socketTimeoutMS: 45_000,
    tls: true,
    retryWrites: true,
    retryReads: true,
    // ❌ REMOVED: checkServerIdentity: true, // This was invalid
  });
}

async function getMongoClient(): Promise<MongoClient> {
  // Return existing healthy client
  if (globalForMongo.mongoClient) {
    try {
      await globalForMongo.mongoClient.db('admin').command({ ping: 1 });
      return globalForMongo.mongoClient;
    } catch (error) {
      console.warn('[mongo] existing client unhealthy, reconnecting...');
      await globalForMongo.mongoClient.close().catch(() => {});
      globalForMongo.mongoClient = undefined;
      globalForMongo.mongoDb = undefined;
    }
  }

  // Wait for existing connection attempt
  if (globalForMongo.connecting) {
    return await globalForMongo.connecting;
  }

  // Start new connection
  globalForMongo.connecting = (async () => {
    const uri = required('MONGODB_URI');
    
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
      throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    }

    const client = createMongoClient(uri);
    
    try {
      console.log('[mongo] Attempting connection...');
      await client.connect();
      
      console.log('[mongo] Testing connection with ping...');
      await client.db('admin').command({ ping: 1 });
      
      console.log('[mongo] ✅ Connected successfully');
      return client;
    } catch (error) {
      console.error('[mongo] ❌ Connection failed:', error);
      
      // Enhanced error reporting
      if (error instanceof Error) {
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
          console.error('[mongo] 🌐 DNS resolution error - check your connection string');
        }
        if (error.message.includes('timeout')) {
          console.error('[mongo] ⏱️  Timeout - connection took too long');
        }
        if (error.message.includes('Authentication failed')) {
          console.error('[mongo] 🔐 Authentication failed - check username/password');
        }
      }
      
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

export async function getDb(): Promise<Db> {
  try {
    const dbName = process.env.MONGODB_DB?.trim() || 'author_site';
    console.log('[mongo] Using database:', dbName);
    
    // Return cached healthy database
    if (globalForMongo.mongoDb && globalForMongo.mongoClient) {
      try {
        await globalForMongo.mongoClient.db('admin').command({ ping: 1 });
        mockDbInUse = false;
        return globalForMongo.mongoDb;
      } catch {
        console.warn('[mongo] cached DB unhealthy, reconnecting...');
        globalForMongo.mongoDb = undefined;
      }
    }

    const client = await getMongoClient();
    globalForMongo.mongoDb = client.db(dbName);
    mockDbInUse = false;
    
    console.log('[mongo] ✅ Using database:', globalForMongo.mongoDb.databaseName);
    return globalForMongo.mongoDb;
    
  } catch (err) {
    console.error('[mongo] Failed to get database:', err);
    
    // ✅ CRITICAL: Don't return fallback in production
    if (!dev) {
      throw err;
    }
    
    // Only fallback in development
    console.warn('[mongo] Development fallback - returning mock database');
    const emptyResult = { toArray: async () => [] };

    mockDbInUse = true;
    return {
      collection: () => ({
        find: () => ({
          sort: () => ({ limit: () => emptyResult, toArray: async () => [] }),
          limit: () => emptyResult,
          toArray: async () => []
        }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: null }),
        updateOne: async () => ({ modifiedCount: 0 }),
        deleteOne: async () => ({ deletedCount: 0 })
      }),
      command: async () => ({ ok: 1 }),
      listCollections: () => ({ toArray: async () => [] }),
      databaseName: 'fallback-db'
    } as unknown as Db;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    if (db.databaseName === 'fallback-db') {
      console.warn('[mongo] ⚠️ Mock database in use - skipping connection test');
      return false;
    }
    await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    console.log('[mongo] ✅ Connection healthy - found collections:',
      collections.map(c => c.name));
    return true;
  } catch (err) {
    console.error('[mongo] ❌ Connection test failed:', err);
    return false;
  }
}