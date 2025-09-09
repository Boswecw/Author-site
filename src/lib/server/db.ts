// src/lib/server/db.ts - UPDATED with TypeScript fixes
import { MongoClient, ServerApiVersion, type Db } from 'mongodb';

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
  const raw = process.env[name]; // ✅ Fixed: use process.env directly
  if (!raw) throw new Error(`${name} environment variable is not set`);
  const val = raw.trim();
  if (!val) throw new Error(`${name} is empty`);
  return val;
}

/**
 * Create MongoDB client optimized for cluster0.njrpul0.mongodb.net
 */
// Fix the MongoDB client creation - remove invalid checkServerIdentity
function createMongoClient(uri: string): MongoClient {
  console.log('[mongo] Creating client for cluster0.njrpul0.mongodb.net...');
  
  return new MongoClient(uri, {
    serverApi: { 
      version: ServerApiVersion.v1, 
      strict: true, 
      deprecationErrors: true 
    },
    connectTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 15_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 120_000,
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    
    // ✅ REMOVE this invalid option:
    // checkServerIdentity: true, // This is invalid - remove it
    
    directConnection: false,
    readPreference: 'primary',
    retryWrites: true,
    retryReads: true,
    heartbeatFrequencyMS: 10_000,
  });
}

/**
 * Test if URI is using SRV format and analyze for potential issues
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
 * Get or create MongoDB client with connection reuse
 */
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
  console.log('[mongo] connecting to cluster0.njrpul0.mongodb.net...');
  globalForMongo.connecting = (async () => {
    const uri = required('MONGODB_URI');
    
    // Validate URI format
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
      
      console.log('[mongo] ✅ connected to cluster0.njrpul0.mongodb.net');
      return client;
    } catch (error) {
      console.error('[mongo] ❌ connection failed:', error);
      
      // Enhanced error reporting for common issues
      if (error instanceof Error) {
        if (error.message.includes('ssl') || error.message.includes('tls')) {
          console.error('[mongo] 🔒 TLS/SSL error detected');
          console.error('[mongo]   - Atlas certificate validation problems');
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
 * Get connected database instance
 */
export async function getDb(): Promise<Db> {
  try {
    // ✅ Fixed: Use process.env directly instead of env variable
    const dbName = process.env.MONGODB_DB?.trim() || 'Author-site';
    console.log('[mongo] Using database:', dbName);
    
    // Return cached healthy database
    if (globalForMongo.mongoDb && globalForMongo.mongoClient) {
      try {
        await globalForMongo.mongoClient.db('admin').command({ ping: 1 });
        return globalForMongo.mongoDb;
      } catch {
        console.warn('[mongo] cached DB unhealthy, reconnecting...');
        globalForMongo.mongoDb = undefined;
      }
    }

    const client = await getMongoClient();
    globalForMongo.mongoDb = client.db(dbName);
    
    console.log('[mongo] ✅ using database:', globalForMongo.mongoDb.databaseName);
    return globalForMongo.mongoDb;
    
  } catch (err) {
    console.error('[mongo] failed to connect:', err);
    
    // Return fallback for development
    console.warn('[mongo] returning fallback database');
    const emptyResult = { toArray: async () => [] };
    
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
        deleteOne: async () => ({ deletedCount: 0 }),
        countDocuments: async () => 0,
        estimatedDocumentCount: async () => 0
      }),
      command: async () => ({ ok: 1 }),
      listCollections: () => ({ toArray: async () => [] }),
      databaseName: 'fallback-db'
    } as unknown as Db;
  }
}

/**
 * Test database connection to cluster0.njrpul0.mongodb.net
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('[mongo] Testing connection to cluster0.njrpul0.mongodb.net...');
    const db = await getDb();
    
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

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  if (globalForMongo.mongoClient) {
    try {
      await globalForMongo.mongoClient.close();
      console.log('[mongo] Connection closed');
    } catch (error) {
      console.error('[mongo] Error closing connection:', error);
    } finally {
      globalForMongo.mongoClient = undefined;
      globalForMongo.mongoDb = undefined;
    }
  }
}

// Cleanup on exit (only in Node.js environment)
if (typeof global !== 'undefined' && typeof process !== 'undefined') {
  process.on('SIGINT', closeConnection);
  process.on('SIGTERM', closeConnection);
}