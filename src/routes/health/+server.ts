// src/routes/health/+server.ts - FIXED
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export async function GET() {
  try {
    // ✅ Test connection by trying to get the database
    const db = await getDb();
    
    // ✅ Try to list collections to verify connection works
    const collections = await db.listCollections().toArray();
    
    return json({
      status: 'ok',
      database: db.databaseName,
      cluster: 'cluster0.njrpul0.mongodb.net',
      healthy: true, // ✅ If we get here, connection is working
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return json({
      status: 'error',
      healthy: false, // ✅ Connection failed
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}