import { json } from '@sveltejs/kit';
import { getDb, testConnection } from '$lib/server/db';

export async function GET() {
  try {
    const isHealthy = await testConnection();
    const db = await getDb();
    
    const collections = await db.listCollections().toArray();
    
    return json({
      status: 'ok',
      database: db.databaseName,
      cluster: 'cluster0.njrpul0.mongodb.net',
      healthy: isHealthy,
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}