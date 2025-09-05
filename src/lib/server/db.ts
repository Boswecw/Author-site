import { MongoClient, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient | null = null;
let db: Db | null = null;

function required(name: string): string {
  const val = env[name];
  if (!val) throw new Error(`${name} environment variable is not set`);
  return val;
}

export async function getDb(): Promise<Db> {
  if (db) return db;

  const uri = required('MONGODB_URI');
  const dbName = required('MONGODB_DB');

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log('[mongo] connected');
  }

  db = client.db(dbName);
  console.log('[mongo] using db:', db.databaseName);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[mongo] connection closed');
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const d = await getDb();
    await d.admin().ping();
    return true;
  } catch (err) {
    console.error('[mongo] ping failed:', err);
    return false;
  }
}
