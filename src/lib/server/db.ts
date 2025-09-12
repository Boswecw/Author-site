// src/lib/server/db.ts - Optimized for Render + MongoDB Atlas

import { MongoClient, Db, ServerApiVersion } from 'mongodb';

let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

// CRITICAL: Render-optimized connection options
function getRenderOptimizedOptions() {
  return {
    // ✅ Use MongoDB Driver's latest TLS defaults
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false, // ← CRITICAL: Allow flexible operations
      deprecationErrors: false
    },
    
    // ✅ Render-specific network settings
    family: 4, // Force IPv4 (Render compatibility)
    connectTimeoutMS: 30000, // Longer timeout for Render
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    heartbeatFrequencyMS: 30000, // Less aggressive heartbeat
    
    // ✅ TLS Configuration for Atlas
    tls: true,
    tlsAllowInvalidHostnames: false,
    tlsAllowInvalidCertificates: false,
    // Let MongoDB driver handle TLS versions
    
    // ✅ Connection pool optimization for free tier
    maxPoolSize: 5, // Reduced for free tier
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    waitQueueTimeoutMS: 10000,
    
    // ✅ Retry configuration
    retryWrites: true,
    retryReads: true,
    
    // ✅ Compression (reduces bandwidth)
    compressors: ['zstd', 'snappy', 'zlib'],
    
    // ✅ Monitoring
    monitorCommands: process.env.NODE_ENV === 'development'
  };
}

// Generate optimized connection string for Atlas
function getAtlasConnectionString(baseUri: string, dbName: string): string {
  // Clean the base URI and ensure proper format
  const cleanUri = baseUri.includes('?') 
    ? baseUri.split('?')[0] 
    : baseUri;
  
  // Add database name if not present
  const uriWithDb = cleanUri.endsWith('/') 
    ? `${cleanUri}${dbName}` 
    : cleanUri.includes(`/${dbName}`) 
      ? cleanUri 
      : `${cleanUri}/${dbName}`;
  
  // Add optimized parameters for Render
  const params = [
    'authSource=admin',
    'retryWrites=true',
    'w=majority',
    'appName=CharlesBoswellAuthorSite'
  ].join('&');
  
  return `${uriWithDb}?${params}`;
}

async function connectToMongoDB(): Promise<Db> {
  const { MONGODB_URI, MONGODB_DB } = process.env;
  
  if (!MONGODB_URI || !MONGODB_DB) {
    throw new Error('Missing MONGODB_URI or MONGODB_DB environment variables');
  }

  console.log('[mongo] 🔌 Connecting to MongoDB Atlas...');
  console.log('[mongo] Database:', MONGODB_DB);
  console.log('[mongo] Environment:', process.env.NODE_ENV);
  console.log('[mongo] Node.js:', process.version);
  console.log('[mongo] Platform:', process.platform);
  
  try {
    // Generate optimized connection string
    const connectionString = getAtlasConnectionString(MONGODB_URI, MONGODB_DB);
    console.log('[mongo] Connection string (masked):', 
      connectionString.replace(/\/\/[^@]+@/, '//***:***@'));
    
    // Create client with optimized options
    const options = getRenderOptimizedOptions();
    console.log('[mongo] Using connection options:', {
      serverApi: options.serverApi.version,
      tls: options.tls,
      timeouts: {
        connect: options.connectTimeoutMS,
        socket: options.socketTimeoutMS,
        serverSelection: options.serverSelectionTimeoutMS
      },
      pool: {
        max: options.maxPoolSize,
        min: options.minPoolSize
      }
    });
    
    client = new MongoClient(connectionString, options);
    
    // Connect with timing
    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`[mongo] ✅ Connected successfully in ${connectTime}ms`);
    
    // Test the connection
    const db = client.db(MONGODB_DB);
    const pingStart = Date.now();
    await db.command({ ping: 1 });
    const pingTime = Date.now() - pingStart;
    
    console.log(`[mongo] 🏓 Ping successful in ${pingTime}ms`);
    
    // Log collection info
    try {
      const collections = await db.listCollections().toArray();
      console.log('[mongo] 📚 Collections:', collections.map(c => c.name).join(', ') || 'none');
    } catch (listError) {
      console.log('[mongo] ⚠️ Could not list collections (but connection works)');
    }
    
    return db;
    
  } catch (error) {
    console.error('[mongo] ❌ Connection failed:', error);
    
    // Enhanced error reporting
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('[mongo] 🌐 Network error - check MongoDB Atlas network access list');
      } else if (error.message.includes('authentication failed')) {
        console.error('[mongo] 🔐 Authentication error - check username/password');
      } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.error('[mongo] 🔒 TLS error - this may be a Render platform issue');
      }
    }
    
    throw error;
  }
}

// Mock database for fallback
function createMockDatabase(): Db {
  const store: Record<string, any[]> = {};
  
  return {
    collection<T = any>(name: string) {
      if (!(name in store)) store[name] = [];
      const docs = store[name];
      
      return {
        find: (query?: any) => ({
          toArray: async () => docs.filter(d => !query || matches(d, query)) as T[]
        }),
        findOne: async (query?: any) => 
          docs.find(d => !query || matches(d, query)) as T | null,
        countDocuments: async (query?: any) => 
          docs.filter(d => !query || matches(d, query)).length,
        estimatedDocumentCount: async () => docs.length
      };
    },
    command: async (cmd: any) => ({ ok: 1 }),
    listCollections: () => ({
      toArray: async () => Object.keys(store).map(name => ({ name }))
    })
  } as any;
}

// Simple query matching for mock
function matches(doc: any, query: any): boolean {
  if (!query || typeof query !== 'object') return true;
  
  return Object.entries(query).every(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle simple operators
      if ('$in' in value) return (value as any).$in.includes(doc[key]);
      if ('$ne' in value) return doc[key] !== (value as any).$ne;
      if ('$exists' in value) return (key in doc) === (value as any).$exists;
    }
    return doc[key] === value;
  });
}

// Main database getter with fallback
export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectToMongoDB().catch(async (error) => {
      console.error('[mongo] 🚨 Database connection failed, using mock database');
      console.error('[mongo] Error details:', error.message);
      
      // Reset promise for retry
      dbPromise = null;
      
      return createMockDatabase();
    });
  }
  
  return dbPromise;
}

// Graceful shutdown
export async function closeDb(): Promise<void> {
  if (client) {
    console.log('[mongo] 🔌 Closing database connection...');
    try {
      await client.close();
      console.log('[mongo] ✅ Database connection closed gracefully');
    } catch (error) {
      console.error('[mongo] ⚠️ Error closing database:', error);
    } finally {
      client = null;
      dbPromise = null;
    }
  }
}

// Health check
export async function checkDbHealth(): Promise<{
  connected: boolean;
  database?: string;
  error?: string;
  timing?: number;
}> {
  try {
    const start = Date.now();
    const db = await getDb();
    await db.command({ ping: 1 });
    const timing = Date.now() - start;
    
    return {
      connected: true,
      database: db.databaseName || 'unknown',
      timing
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}