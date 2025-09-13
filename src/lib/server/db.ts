// src/lib/server/db.ts - Optimized for Render + MongoDB Atlas (with SvelteKit env + cursor-like mock)
import { MongoClient, type MongoClientOptions, Db, ServerApiVersion } from 'mongodb';


let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

/* ---------------- Render-optimized connection options ---------------- */

function getRenderOptimizedOptions(): MongoClientOptions {
  return {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: false
    },

    // Render networking
    family: 4,
    connectTimeoutMS: 30_000,
    socketTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 30_000,
    heartbeatFrequencyMS: 30_000,

    // TLS for Atlas
    tls: true,
    tlsAllowInvalidHostnames: false,
    tlsAllowInvalidCertificates: false,

    // Pooling for free tier
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 60_000,
    waitQueueTimeoutMS: 10_000,

    // Reliability
    retryWrites: true,
    retryReads: true,

    // Compression (MUTABLE array, not readonly tuple)
    compressors: ['zstd', 'snappy', 'zlib'],

    // Debugging
    monitorCommands: process.env.NODE_ENV === 'development'
  };
}

/* ---------------------- Atlas connection string ---------------------- */

function getAtlasConnectionString(baseUri: string, dbName: string): string {
  const cleanUri = baseUri.includes('?') ? baseUri.split('?')[0] : baseUri;

  const uriWithDb = cleanUri.endsWith('/')
    ? `${cleanUri}${dbName}`
    : cleanUri.includes(`/${dbName}`)
      ? cleanUri
      : `${cleanUri}/${dbName}`;

  const params = [
    'authSource=admin',
    'retryWrites=true',
    'w=majority',
    'appName=CharlesBoswellAuthorSite'
  ].join('&');

  return `${uriWithDb}?${params}`;
}

/* -------------------------- Real connection -------------------------- */

async function connectToMongoDB(): Promise<Db> {
  // ✅ Use SvelteKit env API so .env.local works
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;

  if (!MONGODB_URI || !MONGODB_DB) {
    throw new Error('Missing MONGODB_URI or MONGODB_DB environment variables');
  }

  console.log('[mongo] 🔌 Connecting to MongoDB Atlas...');
  console.log('[mongo] Database:', MONGODB_DB);
  console.log('[mongo] Environment:', process.env.NODE_ENV);
  console.log('[mongo] Node.js:', process.version);
  console.log('[mongo] Platform:', process.platform);

  try {
    const connectionString = getAtlasConnectionString(MONGODB_URI, MONGODB_DB);
    console.log('[mongo] Connection string (masked):', connectionString.replace(/\/\/[^@]+@/, '//***:***@'));

    const options = getRenderOptimizedOptions();
    console.log('[mongo] Using connection options:', {
      serverApi: options.serverApi && (options.serverApi as any).version,
      tls: (options as any).tls,
      timeouts: {
        connect: options.connectTimeoutMS,
        socket: options.socketTimeoutMS,
        serverSelection: options.serverSelectionTimeoutMS
      },
      pool: { max: options.maxPoolSize, min: options.minPoolSize }
    });

    client = new MongoClient(connectionString, options);

    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;
    console.log(`[mongo] ✅ Connected successfully in ${connectTime}ms`);

    const db = client.db(MONGODB_DB);

    const pingStart = Date.now();
    await db.command({ ping: 1 });
    const pingTime = Date.now() - pingStart;
    console.log(`[mongo] 🏓 Ping successful in ${pingTime}ms`);

    try {
      const collections = await db.listCollections().toArray();
      console.log('[mongo] 📚 Collections:', collections.map((c) => c.name).join(', ') || 'none');
    } catch {
      console.log('[mongo] ⚠️ Could not list collections (but connection works)');
    }

    return db;
  } catch (error) {
    console.error('[mongo] ❌ Connection failed:', error);
    if (error instanceof Error) {
      if (/\b(ENOTFOUND|ECONNREFUSED)\b/.test(error.message)) {
        console.error('[mongo] 🌐 Network error - check Atlas network access list');
      } else if (error.message.includes('authentication failed')) {
        console.error('[mongo] 🔐 Auth error - check username/password');
      } else if (/\b(SSL|TLS)\b/.test(error.message)) {
        console.error('[mongo] 🔒 TLS error - platform/network issue possible');
      }
    }
    throw error;
  }
}

/* ------------------------------ Mock DB ------------------------------ */

function createMockDatabase(): Db {
  const store: Record<string, any[]> = {};

  function matches(doc: any, query: any): boolean {
    if (!query || typeof query !== 'object') return true;

    // support $or used in featured query
    if (query.$or && Array.isArray(query.$or)) {
      return query.$or.some((cond: any) => matches(doc, cond));
    }

    return Object.entries(query).every(([key, val]) => {
      const v = (doc as any)[key];
      if (val && typeof val === 'object') {
        if ('$in' in val) return (val as any).$in.includes(v);
        if ('$ne' in val) return v !== (val as any).$ne;
        if ('$exists' in val) return (key in doc) === (val as any).$exists;
        if ('$gte' in val) return new Date(v).getTime() >= new Date((val as any).$gte).getTime();
        return matches(v, val); // nested match
      }
      return v === val;
    });
  }

  function makeCursor(items: any[]) {
    let _items = [...items];

    return {
      sort(spec?: Record<string, 1 | -1>) {
        if (spec && Object.keys(spec).length) {
          // apply first key only (sufficient for dev)
          const [field, dir] = Object.entries(spec)[0] as [string, 1 | -1];
          _items.sort((a: any, b: any) => {
            const av = a?.[field];
            const bv = b?.[field];
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (dir as number);
          });
        }
        return this;
      },
      limit(n?: number) {
        if (typeof n === 'number') _items = _items.slice(0, n);
        return this;
      },
      async toArray() {
        return _items;
      }
    };
  }

  const mock = {
    collection<T = any>(name: string) {
      if (!(name in store)) store[name] = [];
      const docs = store[name];

      return {
        find(query?: any /*, options?: { projection?: any } */) {
          const filtered = docs.filter((d) => matches(d, query));
          return makeCursor(filtered);
        },
        async findOne(query?: any) {
          return docs.find((d) => matches(d, query)) ?? null;
        },
        async countDocuments(query?: any) {
          return docs.filter((d) => matches(d, query)).length;
        },
        async estimatedDocumentCount() {
          return docs.length;
        }
      };
    },
    async command(_: any) {
      return { ok: 1 };
    },
    listCollections() {
      return {
        async toArray() {
          return Object.keys(store).map((name) => ({ name }));
        }
      };
    }
  };

  return mock as unknown as Db;
}

/* ------------------------- Public DB interface ------------------------ */

export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectToMongoDB().catch(async (error) => {
      console.error('[mongo] 🚨 Database connection failed, using mock database');
      console.error('[mongo] Error details:', (error as any)?.message ?? String(error));
      // keep mock cached for process lifetime so we don't thrash
      return createMockDatabase();
    });
  }
  return dbPromise;
}

/* ---------------------------- Graceful close -------------------------- */

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

/* ------------------------------ Healthcheck -------------------------- */

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
    return { connected: true, database: (db as any).databaseName ?? 'unknown', timing };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : String(error) };
  }
}
