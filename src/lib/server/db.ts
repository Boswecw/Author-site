// src/lib/server/db.ts
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

// ---- Helpers for mock ----
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
            if (av == null && bv == null) continue;
            if (av == null) return 1;
            if (bv == null) return -1;
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
          }
          return 0;
        });
      }
      return this;
    },
    skip(n: number) {
      arr = arr.slice(n);
      return this;
    },
    limit(n: number) {
      arr = arr.slice(0, n);
      return this;
    },
    async toArray() {
      return arr;
    }
  };
}

function makeMockDb(): Db {
  console.warn('[mongo] Development fallback - returning mock database');

  const store: Record<string, any[]> = {
    books: [],
    posts: []
  };

  const mock: MinimalDb = {
    databaseName: 'mock',
    collection<T extends Document = Document>(name: string): MinimalCollection<T> {
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

  return mock as unknown as Db;
}
// ---- /mock helpers ----

async function connectRealDb(): Promise<Db> {
  const { MONGODB_URI, MONGODB_DB } = process.env;
  if (!MONGODB_URI || !MONGODB_DB) return makeMockDb();

  if (!client) {
    client = new MongoClient(MONGODB_URI, { serverApi: ServerApiVersion.v1 });
    await client.connect();
  }
  const db = client.db(MONGODB_DB);
  console.log('[mongo] Using database:', db.databaseName);
  return db;
}

export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectRealDb().catch((err) => {
      console.error('[mongo] Failed to get database:', err);
      return makeMockDb();
    });
  }
  return dbPromise;
}

// Optional: helper to close the client in tests or on shutdown
export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbPromise = null;
  }
}
