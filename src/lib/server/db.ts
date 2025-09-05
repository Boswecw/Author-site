// src/lib/server/db.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbOverride = process.env.MONGODB_DB; // e.g. "Author-site"

let client: MongoClient;
let dbPromise: Promise<import('mongodb').Db>;

export async function getDb() {
  if (!dbPromise) {
    client = new MongoClient(uri);
    const connected = client.connect();
    dbPromise = connected.then(() => {
      // get DB name from URI path if present
      let dbFromUri: string | undefined;
      try {
        const u = new URL(uri);
        const path = u.pathname.replace(/^\//, '');
        dbFromUri = path || undefined;
      } catch {
        dbFromUri = undefined;
      }
      const dbName = dbOverride || dbFromUri || 'author_site'; // last resort default
      const db = client.db(dbName);
      console.log('[mongo] using db:', db.databaseName); // keep for now; remove later
      return db;
    });
  }
  return dbPromise;
}
