// src/lib/server/db.ts - OPTIMIZED for Render deployment
import { MongoClient, ServerApiVersion, type Db, type Document } from 'mongodb';

let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

// ---- Minimal types for our mock + usage ----
type Cursor<T> = {
  sort(spec?: Record<string, 1 | -1>): Cursor<T>;
  skip(n: number): Cursor<T>;
  limit(n: number): Cursor<T>;
  toArray(): Promise<T[]>;
};

type MinimalCollection<T extends Document> = {
  find(query?: any, options?: any): Cursor<T>;
  findOne(query?: any, options?: any): Promise<T | null>;
  countDocuments?(query?: any): Promise<number>;
  estimatedDocumentCount?(): Promise<number>;
};

type MinimalDb = {
  databaseName?: string;
  collection<T extends Document = Document>(name: string): MinimalCollection<T>;
  listCollections?: () => { toArray(): Promise<Array<{ name: string }>> };
};

// ---- Mock helpers (unchanged) ----
function matches(doc: any, query: Record<string, any> = {}): boolean {
  for (const [k, v] of Object.entries(query)) {
    const dv = (doc as any)[k];
    if (v && typeof v === 'object' && '$in' in v) {
      const set = (v as any).$in;
      if (!Array.isArray(set) || !set.includes(dv)) return false;
    } else if (dv !== v) {
      return false;
    }
  }
  return true;
}

function projectDoc<T extends Record<string, any>>(doc: T, projection?: Record<string, number>): T {
  if (!projection) return doc;
  const keys = Object.keys(projection).filter((k) => projection[k]);
  if (!keys.length) return doc;
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = (doc as any)[k];
  return out as T;
}

function makeCursor<T>(arrIn: T[]): Cursor<T> {
  let arr = [...arrIn];
  return {
    sort(spec?: Record<string, 1 | -1>) {
      if (spec && Object.keys(spec).length) {
        const keys = Object.keys(spec);
        arr.sort((a: any, b: any) => {
          for (const k of keys) {
            const dir = spec[k] === -1 ? -1 : 1;
            const av = (a as any)?.[k];
            const bv = (b as any)?.[k];
            if (av < bv) return -dir;
            if (av > bv) return dir;
          }
          return 0;
        });
      }
      return this;
    },
    skip(n) {
      arr = arr.slice(n);
      return this;
    },
    limit(n) {
      arr = arr.slice(0, n);
      return this;
    },
    async toArray() {
      return arr;
    }
  };
}

function makeMockDb(): MinimalDb {
  const store: Record<string, any[]> = {
    books: [
      {
        _id: 'mock1',
        title: 'The Echoes of Tomorrow',
        slug: 'echoes-of-tomorrow',
        status: 'published',
        featured: true
      }
    ],
    posts: []
  };

  return {
    databaseName: 'mock_db',
    collection<T extends Document>(name: string): MinimalCollection<T> {
      const all = store[name] ?? [];
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

// ---- Real DB connection with Render optimizations ----
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
      // 🔥 RENDER-OPTIMIZED MongoDB Configuration
      const connectionOptions = {
        // Server API configuration
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        
        // 🔥 CRITICAL: Enhanced TLS/SSL configuration for Render
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        tlsInsecure: false,
        
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
        
        // 🔥 RENDER-SPECIFIC: Buffer configuration
        bufferMaxEntries: 0, // Disable mongoose buffering
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
        // 🔥 RENDER-SPECIFIC: Additional stability options
        maxStalenessSeconds: 90,
        compressors: ['snappy', 'zlib'], // Enable compression
      };

      console.log('[mongo] Creating MongoClient with Render-optimized configuration...');
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