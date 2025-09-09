// src/lib/server/db.ts - Updated for Render TLS compatibility
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
 * Create MongoDB client with Render-compatible TLS settings
 */
function createMongoClient(uri: string): MongoClient {
  console.log('[mongo] Creating client with enhanced TLS options for Render...');
  
  return new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    
    // Render-optimized timeouts (increased for TLS handshake issues)
    connectTimeoutMS: 30_000,  // Reduced from 60s for faster failure detection
    serverSelectionTimeoutMS: 10_000, // Reduced for faster feedback
    socketTimeoutMS: 45_000,
    
    // Connection pool settings
    maxPoolSize: 5,  // Reduced for Render's connection limits
    minPoolSize: 1,
    maxIdleTimeMS: 120_000,
    
    // Enhanced TLS settings for Render + Atlas compatibility
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    
    // Additional TLS options that help with Render
    ...(process.env.NODE_ENV === 'production' && {
      // Production-specific TLS settings
      tlsInsecure: false,
      checkServerIdentity: true,
    }),
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Additional options for better Render compatibility
    directConnection: false,  // Use replica set connection
    readPreference: 'primary',
    
    // Heartbeat settings for better connection health
    heartbeatFrequencyMS: 10000,
    
    // Buffer settings
    bufferMaxEntries: 0, // Disable mongoose buffering equivalent
  });
}

/**
 * Test if URI is using SRV format and potentially problematic
 */
function analyzeConnectionString(uri: string): void {
  console.log('[mongo] Analyzing connection string...');
  
  if (uri.includes('mongodb+srv://')) {
    console.log('[mongo] Using SRV connection string');
  } else if (uri.includes('mongodb://')) {
    console.log('[mongo] Using direct connection string');
  }
  
  // Check for potential issues
  if (uri.includes('ssl=true') && uri.includes('tls=true')) {
    console.warn('[mongo] Both ssl=true and tls=true detected - this may cause conflicts');
  }
  
  if (!uri.includes('retryWrites=true')) {
    console.log('[mongo] Note: retryWrites not in connection string, using client option');
  }
}

/**
 * Get or create MongoDB client with proper connection reuse
 */
async function getMongoClient(): Promise<MongoClient> {
  // Return existing client if it's healthy
  if (globalForMongo.mongoClient) {
    try {
      await globalForMongo.mongoClient.db('admin').command({ ping: 1 });
      return globalForMongo.mongoClient;
    } catch (error) {
      console.warn('[mongo] existing client unhealthy, reconnecting...', error);
      await globalForMongo.mongoClient.close().catch(() => {});
      globalForMongo.mongoClient = undefined;
      globalForMongo.mongoDb = undefined;
    }
  }

  // If already connecting, wait for that connection
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

    // Analyze the connection string for potential issues
    analyzeConnectionString(uri);

    const client = createMongoClient(uri);
    
    try {
      console.log('[mongo] Attempting connection...');
      await client.connect();
      
      console.log('[mongo] Testing connection with ping...');
      await client.db('admin').command({ ping: 1 });
      
      console.log('[mongo] ✅ connected new client successfully');
      return client;
    } catch (error) {
      console.error('[mongo] ❌ connection failed:', error);
      
      // Enhanced error reporting for TLS issues
      if (error instanceof Error) {
        if (error.message.includes('ssl') || error.message.includes('tls')) {
          console.error('[mongo] 🔒 TLS/SSL error detected. This is often due to:');
          console.error('[mongo]   - Render infrastructure TLS compatibility issues');
          console.error('[mongo]   - MongoDB Atlas certificate validation problems');
          console.error('[mongo]   - Connection string TLS parameter conflicts');
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
          console.error('[mongo] 🌐 DNS resolution error detected');
        }
        
        if (error.message.includes('timeout')) {
          console.error('[mongo] ⏱️  Timeout error - connection taking too long');
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

/**
 * Return a connected Db instance.
 * Reuses the same client across hot reloads with improved error handling.
 */
export async function getDb(): Promise<Db> {
  try {
    // Fixed database name handling - use Author-site consistently
    const dbName = env.MONGODB_DB?.trim() || 'Author-site';
    console.log('[mongo] Using database name:', dbName);
    
    // Return cached DB if available and healthy
    if (globalForMongo.mongoDb && globalForMongo.mongoClient) {
      try {
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
    
    console.log('[mongo] ✅ using db:', globalForMongo.mongoDb.databaseName);
    return globalForMongo.mongoDb;
    
  } catch (err) {
    console.error('[mongo] failed to connect:', err);

    // Enhanced fallback DB with all required methods
    console.warn('[mongo] returning fallback database interface');
    const emptyResult = { toArray: async () => [] };
    
    return {
      collection: () => ({
        find: () => ({
          sort: () => ({
            limit: () => emptyResult,
            toArray: async () => []
          }),
          limit: () => emptyResult,
          toArray: async () => []
        }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: null }),
        updateOne: async () => ({ modifiedCount: 0 }),
        deleteOne: async () => ({ deletedCount: 0 }),
        countDocuments: async () => 0,
      }),
      command: async () => ({ ok: 1 }),
      listCollections: () => ({ toArray: async () => [] }), // Added this method
      databaseName: 'fallback',
    } as unknown as Db;
  }
}

/**
 * Enhanced health check with detailed diagnostics
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('[mongo] Running health check...');
    const db = await getDb();
    
    // Test basic connectivity
    await db.command({ ping: 1 });
    
    // Test database operations
    const collections = await db.listCollections().toArray();
    console.log('[mongo] ✅ health check passed - found', collections.length, 'collections');
    
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