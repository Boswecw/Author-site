// Replace your src/routes/health/+server.ts with this to see the real error

import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';

export async function GET() {
  console.log('[health] Checking MongoDB connection...');
  
  // Check environment variables first
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  
  console.log('[health] Environment check:', {
    hasURI: !!MONGODB_URI,
    hasDB: !!MONGODB_DB,
    dbName: MONGODB_DB,
    uriStart: MONGODB_URI?.substring(0, 50) + '...'
  });

  if (!MONGODB_URI || !MONGODB_DB) {
    return json({
      status: 'error',
      healthy: false,
      error: `Missing environment variables: ${!MONGODB_URI ? 'MONGODB_URI ' : ''}${!MONGODB_DB ? 'MONGODB_DB' : ''}`,
      database: 'none',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  let client;
  try {
    console.log('[health] Connecting to MongoDB...');
    
    client = new MongoClient(MONGODB_URI, { 
      serverApi: ServerApiVersion.v1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('[health] Connected! Getting database...');
    
    const db = client.db(MONGODB_DB);
    console.log('[health] Database name:', db.databaseName);
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log('[health] Ping successful!');
    
    const collections = await db.listCollections().toArray();
    console.log('[health] Collections:', collections.map(c => c.name));
    
    await client.close();

    return json({
      status: 'ok',
      database: db.databaseName,
      cluster: 'cluster0.njrpul0.mongodb.net',
      healthy: true,
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[health] MongoDB connection failed:', error);
    
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('[health] Error closing client:', closeError);
      }
    }

    return json({
      status: 'error',
      healthy: false,
      database: 'failed',
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}