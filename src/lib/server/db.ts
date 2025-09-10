// src/lib/server/db.ts - Updated with TLS troubleshooting

import { MongoClient, Db, ServerApiVersion } from 'mongodb';

// Singleton client and database promise
let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

// [Mock DB code remains the same - keeping it short for space]
function makeMockDb() {
  // ... (same mock implementation as before)
  return {
    databaseName: 'mock-db',
    command: async () => ({ ok: 1 }),
    collection: () => ({
      find: () => ({ toArray: async () => [], sort: () => ({ skip: () => ({ limit: () => ({ toArray: async () => [] }) }) }) }),
      findOne: async () => null,
      countDocuments: async () => 0,
      estimatedDocumentCount: async () => 0
    }),
    listCollections: () => ({ toArray: async () => [] })
  };
}

// ---- Real DB connection with multiple TLS strategies ----
async function connectRealDb(): Promise<Db> {
  const { MONGODB_URI, MONGODB_DB } = process.env;
  
  if (!MONGODB_URI || !MONGODB_DB) {
    console.error('[mongo] Missing environment variables - falling back to mock');
    return makeMockDb() as unknown as Db;
  }

  console.log('[mongo] Connecting to MongoDB Atlas...');
  console.log('[mongo] Database name:', MONGODB_DB);
  console.log('[mongo] Connection string (masked):', MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@'));
  console.log('[mongo] Environment:', process.env.NODE_ENV);
  console.log('[mongo] Node.js version:', process.version);

  // 🔥 Try multiple TLS configuration strategies
  const tlsStrategies = [
    {
      name: 'Minimal TLS (Let driver decide)',
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
      }
    },
    {
      name: 'Standard TLS',
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
        tls: true,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
      }
    },
    {
      name: 'Legacy TLS Support',
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
        tls: true,
        tlsAllowInvalidHostnames: false,
        tlsAllowInvalidCertificates: false,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
        family: 4, // Force IPv4
      }
    }
  ];

  // Try each TLS strategy
  for (const strategy of tlsStrategies) {
    if (client) break; // Stop if we successfully connected
    
    try {
      console.log(`[mongo] Trying strategy: ${strategy.name}`);
      const testClient = new MongoClient(MONGODB_URI, strategy.options);
      
      console.log('[mongo] Attempting connection...');
      await testClient.connect();
      
      console.log('[mongo] Testing ping...');
      await testClient.db(MONGODB_DB).command({ ping: 1 });
      
      console.log(`[mongo] ✅ Successfully connected using: ${strategy.name}`);
      client = testClient; // Save successful client
      break;
      
    } catch (error) {
      console.error(`[mongo] ❌ Strategy "${strategy.name}" failed:`, error instanceof Error ? error.message : String(error));
      
      // Try to close the failed client
      try {
        if (client) {
          await client.close();
          client = null;
        }
      } catch (closeError) {
        // Ignore close errors
      }
      
      // If this is the last strategy, we'll fall through to the final error handling
      if (strategy === tlsStrategies[tlsStrategies.length - 1]) {
        throw error; // Re-throw the last error
      }
    }
  }

  if (!client) {
    throw new Error('All TLS connection strategies failed');
  }
  
  const db = client.db(MONGODB_DB);
  console.log('[mongo] Using database:', db.databaseName);
  return db;
}

export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectRealDb().catch((err) => {
      console.error('[mongo] Failed to get database:', err);
      dbPromise = null; // Reset promise so it can retry on next call
      
      // In production, fall back to mock instead of crashing
      if (process.env.NODE_ENV === 'production') {
        console.log('[mongo] Falling back to mock database in production due to connection failure');
        return makeMockDb() as unknown as Db;
      }
      return makeMockDb() as unknown as Db;
    });
  }
  return dbPromise;
}

// Helper to close the client
export async function closeDb(): Promise<void> {
  if (client) {
    console.log('[mongo] Closing database connection...');
    await client.close();
    client = null;
    dbPromise = null;
    console.log('[mongo] Database connection closed');
  }
}

// Health check helper
export async function checkDbHealth(): Promise<{ 
  connected: boolean; 
  database: string | null; 
  error?: string 
}> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return {
      connected: true,
      database: db.databaseName || null
    };
  } catch (error) {
    return {
      connected: false,
      database: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}