// src/lib/server/db.ts
import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from '$env/dynamic/private';

if (!env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
if (!env.MONGODB_DB) throw new Error('Missing MONGODB_DB');

type GlobalWithMongo = typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

const g = globalThis as GlobalWithMongo;

const clientPromise =
  g.__mongoClientPromise ??
  new MongoClient(env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,          // keep guardrails ON
      deprecationErrors: true
    }
  }).connect();

if (import.meta.env.DEV) g.__mongoClientPromise = clientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(env.MONGODB_DB);
}

export async function getClient() {
  return clientPromise;
}
