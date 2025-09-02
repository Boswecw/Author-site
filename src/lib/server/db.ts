// src/lib/server/db.ts
// Use one of these imports — not both:

// ✅ Static (best for production builds/adapters like Vercel/Netlify)
import { MONGODB_URI, MONGODB_DB } from '$env/static/private';

// OR
// ✅ Dynamic (reads process.env at runtime; useful if envs change after build)
// import { env } from '$env/dynamic/private';
// const MONGODB_URI = env.MONGODB_URI;
// const MONGODB_DB = env.MONGODB_DB;

import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let connecting: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  if (client) return client;

  if (!connecting) {
    connecting = (async () => {
      if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');
      if (!MONGODB_DB) throw new Error('MONGODB_DB is missing');

      const c = new MongoClient(MONGODB_URI);
      await c.connect();

      // Optional: quick ping to confirm connectivity
      await c.db(MONGODB_DB).command({ ping: 1 });
      console.log('[Mongo] Connected successfully');

      client = c;
      return c;
    })().catch((e) => {
      // Reset so future calls retry
      connecting = null;
      throw e;
    });
  }

  return connecting;
}

export async function getDb() {
  const c = await getClient();
  return c.db(MONGODB_DB);
}
