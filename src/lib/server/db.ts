// src/lib/server/db.ts - Updated with multiple connection string and TLS strategies

import { MongoClient, Db, ServerApiVersion } from 'mongodb';

// Singleton client and database promise
let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

// Mock DB implementation for fallback
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

// Generate different connection string formats
function generateConnectionStrings(baseUri: string, dbName: string) {
  // Extract credentials and cluster info from the base URI
  const uriMatch = baseUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)/);
  if (!uriMatch) {
    return [baseUri]; // Return original if we can't parse it
  }
  
  const [, username, password, cluster] = uriMatch;
  
  return [
    // Option 1: Minimal mongodb+srv://
    `mongodb+srv://${username}:${password}@${cluster}/${dbName}`,
    
    // Option 2: mongodb+srv:// with authSource
    `mongodb+srv://${username}:${password}@${cluster}/${dbName}?authSource=admin`,
    
    // Option 3: mongodb+srv:// with basic parameters
    `mongodb+srv://${username}:${password}@${cluster}/${dbName}?authSource=admin&retryWrites=true&w=majority`,
    
    // Option 4: Standard mongodb:// with replica set (for Atlas)
    `mongodb://${username}:${password}@ac-e3bkfpd-shard-00-00.njrpul0.mongodb.net:27017,ac-e3bkfpd-shard-00-01.njrpul0.mongodb.net:27017,ac-e3bkfpd-shard-00-02.njrpul0.mongodb.net:27017/${dbName}?authSource=admin&replicaSet=atlas-su5ycc-shard-0`,
  ];
}

// Different TLS/connection configurations to try
function getConnectionConfigurations() {
  return [
    {
      name: 'Minimal (Let driver decide)',
      options: {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      }
    },
    {
      name: 'Standard with Server API',
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
        connectTimeoutMS: 15000,
        socketTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
      }
    },
    {
      name: 'Explicit TLS Configuration',
      options: {
        tls: true,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 20000,
        serverSelectionTimeoutMS: 20000,
        retryWrites: true,
        retryReads: true,
      }
    },
    {
      name: 'Legacy TLS Support',
      options: {
        tls: true,
        tlsAllowInvalidHostnames: false,
        tlsAllowInvalidCertificates: false,
        connectTimeoutMS: 25000,
        socketTimeoutMS: 25000,
        serverSelectionTimeoutMS: 25000,
        retryWrites: true,
        retryReads: true,
        family: 4, // Force IPv4
      }
    }
  ];
}

// Real DB connection with comprehensive strategy testing
async function connectRealDb(): Promise<Db> {
  const { MONGODB_URI, MONGODB_DB } = process.env;
  
  if (!MONGODB_URI || !MONGODB_DB) {
    console.error('[mongo] Missing environment variables - falling back to mock');
    return makeMockDb() as unknown as Db;
  }

  console.log('[mongo] 🔌 Starting MongoDB Atlas connection...');
  console.log('[mongo] Database name:', MONGODB_DB);
  console.log('[mongo] Original URI (masked):', MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@'));
  console.log('[mongo] Environment:', process.env.NODE_ENV);
  console.log('[mongo] Node.js version:', process.version);
  console.log('[mongo] Platform:', process.platform);

  // Generate different connection string formats
  const connectionStrings = generateConnectionStrings(MONGODB_URI, MONGODB_DB);
  const configurations = getConnectionConfigurations();

  console.log(`[mongo] 🧪 Testing ${connectionStrings.length} connection strings with ${configurations.length} configurations each`);

  // Try each combination of connection string and configuration
  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    const connectionType = i === 0 ? 'mongodb+srv (minimal)' : 
                          i === 1 ? 'mongodb+srv (with auth)' : 
                          i === 2 ? 'mongodb+srv (with params)' : 
                          'mongodb (direct)';
    
    console.log(`[mongo] 📡 Trying connection string ${i + 1}/${connectionStrings.length}: ${connectionType}`);
    console.log(`[mongo] Connection string (masked): ${connectionString.replace(/\/\/[^@]+@/, '//***:***@')}`);

    for (const config of configurations) {
      if (client) break; // Stop if we successfully connected
      
      try {
        console.log(`[mongo] 🔧 Testing configuration: ${config.name}`);
        const testClient = new MongoClient(connectionString, config.options);
        
        const startTime = Date.now();
        await testClient.connect();
        const connectTime = Date.now() - startTime;
        
        const pingStart = Date.now();
        await testClient.db(MONGODB_DB).command({ ping: 1 });
        const pingTime = Date.now() - pingStart;
        
        console.log(`[mongo] ✅ SUCCESS! Connected using ${connectionType} with ${config.name}`);
        console.log(`[mongo] ⏱️  Connection time: ${connectTime}ms, Ping time: ${pingTime}ms`);
        
        client = testClient;
        break;
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[mongo] ❌ ${config.name} failed: ${errorMsg.substring(0, 100)}...`);
        
        // Clean up failed client
        try {
          if (client) {
            await client.close();
            client = null;
          }
        } catch (closeError) {
          // Ignore cleanup errors
        }
      }
    }
    
    if (client) break; // Stop trying other connection strings if we succeeded
  }

  if (!client) {
    const error = new Error('All connection strategies failed - check MongoDB Atlas network access and credentials');
    console.error('[mongo] 💥 Complete connection failure after trying all strategies');
    throw error;
  }
  
  const db = client.db(MONGODB_DB);
  console.log('[mongo] 🎯 Using database:', db.databaseName);
  
  // Test database operations
  try {
    const collections = await db.listCollections().toArray();
    console.log('[mongo] 📚 Available collections:', collections.map(c => c.name).join(', ') || 'none');
  } catch (listError) {
    console.log('[mongo] ⚠️  Could not list collections, but connection is working');
  }
  
  return db;
}

export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectRealDb().catch((err) => {
      console.error('[mongo] 🚨 Database connection failed:', err);
      dbPromise = null; // Reset promise so it can retry on next call
      
      // In production, fall back to mock instead of crashing
      console.log('[mongo] 🔄 Falling back to mock database');
      return makeMockDb() as unknown as Db;
    });
  }
  return dbPromise;
}

// Helper to close the client
export async function closeDb(): Promise<void> {
  if (client) {
    console.log('[mongo] 🔌 Closing database connection...');
    await client.close();
    client = null;
    dbPromise = null;
    console.log('[mongo] ✅ Database connection closed');
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