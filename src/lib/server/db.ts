// src/lib/server/db.ts - Complete fixed MongoDB connection file

import { MongoClient, Db, ServerApiVersion } from 'mongodb';

// Singleton client and database promise
let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

// ---- Mock DB for development/fallback ----
function makeMockDb() {
  const store: Record<string, any[]> = {
    books: [],
    posts: [],
  };

  function matches(doc: any, query: Record<string, unknown>): boolean {
    return Object.entries(query).every(([key, value]) => {
      if (key === '_id' && typeof value === 'string') {
        return doc._id?.toString() === value || doc.id === value;
      }
      return doc[key] === value;
    });
  }

  function projectDoc(doc: any, projection?: Record<string, 0 | 1>): any {
    if (!projection) return doc;
    const result: any = {};
    const include = Object.values(projection).some(v => v === 1);
    
    if (include) {
      Object.entries(projection).forEach(([key, val]) => {
        if (val === 1) result[key] = doc[key];
      });
    } else {
      Object.assign(result, doc);
      Object.entries(projection).forEach(([key, val]) => {
        if (val === 0) delete result[key];
      });
    }
    return result;
  }

  function makeCursor<T>(items: T[]) {
    let sortBy: Record<string, 1 | -1> = {};
    let skipCount = 0;
    let limitCount = 0;

    return {
      sort(sort: Record<string, 1 | -1>) {
        sortBy = sort;
        return this;
      },
      skip(count: number) {
        skipCount = count;
        return this;
      },
      limit(count: number) {
        limitCount = count;
        return this;
      },
      async toArray(): Promise<T[]> {
        let result = [...items];
        
        if (Object.keys(sortBy).length > 0) {
          result.sort((a, b) => {
            for (const [key, order] of Object.entries(sortBy)) {
              const aVal = (a as any)[key];
              const bVal = (b as any)[key];
              if (aVal < bVal) return order === 1 ? -1 : 1;
              if (aVal > bVal) return order === 1 ? 1 : -1;
            }
            return 0;
          });
        }
        
        if (skipCount > 0) result = result.slice(skipCount);
        if (limitCount > 0) result = result.slice(0, limitCount);
        
        return result;
      }
    };
  }

  return {
    databaseName: 'mock-db',
    command: async () => ({ ok: 1 }),
    collection<T = any>(name: string) {
      if (!(name in store)) store[name] = [];
      const all = store[name];
      
      return {
        find(query?: any, options?: any) {
          const filtered = all
            .filter((d) => matches(d, query ?? {}))
            .map((d) => projectDoc(d, options?.projection));
          return makeCursor<T>(filtered as T[]);
        },
        async findOne(query?: any, options?: any) {
          const doc = all.find((d) => matches(d, query ?? {}));
          return doc ? (projectDoc(doc, options?.projection) as T) : null;
        },
        async countDocuments(query?: any) {
          return all.filter((d) => matches(d, query ?? {})).length;
        },
        async estimatedDocumentCount() {
          return all.length;
        }
      };
    },
    listCollections: () => ({
      toArray: async () => Object.keys(store).map((name) => ({ name }))
    })
  };
}

// ---- Real DB connection with fixed TLS configuration ----
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

  try {
    if (!client) {
      // 🔥 FIXED: MongoDB Configuration for Render with proper TLS settings
      const connectionOptions = {
        // Server API configuration
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        
        // 🔥 FIXED: Simplified TLS configuration for MongoDB Atlas
        // MongoDB Atlas handles TLS automatically, minimal config needed
        tls: true,
        
        // 🔥 RENDER-SPECIFIC: Extended timeouts for cloud infrastructure
        connectTimeoutMS: 60000,     // 60 seconds
        socketTimeoutMS: 60000,      // 60 seconds  
        serverSelectionTimeoutMS: 60000, // 60 seconds
        heartbeatFrequencyMS: 10000, // 10 seconds
        
        // 🔥 RENDER-SPECIFIC: Connection pool optimization
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 5000,
        
        // 🔥 RENDER-SPECIFIC: Network and retry configuration
        retryWrites: true,
        retryReads: true,
        family: 4, // Force IPv4 for better cloud compatibility
      };

      console.log('[mongo] Creating MongoClient with fixed TLS configuration...');
      client = new MongoClient(MONGODB_URI, connectionOptions);
      
      console.log('[mongo] Attempting connection...');
      await client.connect();
      
      console.log('[mongo] Testing ping...');
      await client.db(MONGODB_DB).command({ ping: 1 });
      
      console.log('[mongo] ✅ Successfully connected to MongoDB Atlas!');
    }
    
    const db = client.db(MONGODB_DB);
    console.log('[mongo] Using database:', db.databaseName);
    return db;
    
  } catch (error) {
    console.error('[mongo] ❌ Connection failed:', error);
    console.error('[mongo] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      codeName: (error as any)?.codeName,
    });
    
    // Clean up failed client
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('[mongo] Error closing failed client:', closeError);
      }
      client = null;
    }
    
    // In production, re-throw the error to make it visible
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    
    // In development, fall back to mock
    console.log('[mongo] Falling back to mock database for development');
    return makeMockDb() as unknown as Db;
  }
}

export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectRealDb().catch((err) => {
      console.error('[mongo] Failed to get database:', err);
      dbPromise = null; // Reset promise so it can retry on next call
      
      // In production, re-throw; in development, use mock
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
      return makeMockDb() as unknown as Db;
    });
  }
  return dbPromise;
}

// Helper to close the client (useful for testing and graceful shutdown)
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