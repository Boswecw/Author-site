import { json } from '@sveltejs/kit';
import { getDb, testConnection } from '$lib/server/db';
import { ENV } from '$lib/config/env';

export async function GET() {
  try {
    const isHealthy = await testConnection();
    const db = await getDb();

    const collections = await db.listCollections().toArray();

    const uri = ENV.MONGODB_URI;
    const cluster = uri ? new URL(uri).hostname : undefined;

    return json({
      status: 'ok',
      database: db.databaseName,
      cluster,
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
