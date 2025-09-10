// src/routes/debug/mongodb/+server.ts - Enhanced MongoDB diagnostic
import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';

export async function GET() {
  console.log('[mongodb-debug] 🔍 Starting comprehensive MongoDB diagnostic...');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  
  // Environment validation
  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      workingDir: process.cwd(),
    },
    config: {
      hasMongoUri: !!MONGODB_URI,
      mongoDbName: MONGODB_DB || 'NOT_SET',
      uriFormat: MONGODB_URI ? 'mongodb+srv://' + MONGODB_URI.split('://')[1]?.split('@')[1] : 'MISSING',
    },
    connection: {
      status: 'pending',
      error: null as string | null,
      details: {} as any,
      timing: {
        startTime: Date.now(),
        connectionTime: null as number | null,
        pingTime: null as number | null,
      }
    },
    database: {
      connected: false,
      collections: [] as string[],
      collectionCounts: {} as Record<string, number>,
    }
  };

  // Test 1: Environment variables
  if (!MONGODB_URI || !MONGODB_DB) {
    const missing = [];
    if (!MONGODB_URI) missing.push('MONGODB_URI');
    if (!MONGODB_DB) missing.push('MONGODB_DB');
    
    diagnostic.connection.status = 'config_error';
    diagnostic.connection.error = `Missing environment variables: ${missing.join(', ')}`;
    
    return json(diagnostic, { status: 500 });
  }

  // Test 2: Connection string validation
  try {
    const url = new URL(MONGODB_URI);
    diagnostic.config.uriFormat = `${url.protocol}//${url.hostname}${url.pathname}`;
  } catch (error) {
    diagnostic.connection.status = 'invalid_uri';
    diagnostic.connection.error = `Invalid MongoDB URI format: ${error}`;
    return json(diagnostic, { status: 500 });
  }

  // Test 3: MongoDB connection
  let client: MongoClient | null = null;
  
  try {
    const connectionOptions = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      // Enhanced TLS configuration
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      tlsInsecure: false,
      // Extended timeouts for Render
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      heartbeatFrequencyMS: 10000,
      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 5000,
      // Network configuration
      retryWrites: true,
      retryReads: true,
      family: 4, // IPv4 only
    };

    console.log('[mongodb-debug] Creating client...');
    client = new MongoClient(MONGODB_URI, connectionOptions);
    
    console.log('[mongodb-debug] Attempting connection...');
    const connectionStart = Date.now();
    await client.connect();
    diagnostic.connection.timing.connectionTime = Date.now() - connectionStart;
    
    console.log('[mongodb-debug] Testing ping...');
    const pingStart = Date.now();
    await client.db(MONGODB_DB).command({ ping: 1 });
    diagnostic.connection.timing.pingTime = Date.now() - pingStart;
    
    diagnostic.connection.status = 'connected';
    diagnostic.database.connected = true;
    
    // Test 4: Database operations
    const db = client.db(MONGODB_DB);
    console.log('[mongodb-debug] Listing collections...');
    
    try {
      const collections = await db.listCollections().toArray();
      diagnostic.database.collections = collections.map(c => c.name);
      
      // Get collection counts
      for (const collection of diagnostic.database.collections) {
        try {
          const count = await db.collection(collection).estimatedDocumentCount();
          diagnostic.database.collectionCounts[collection] = count;
        } catch (countError) {
          diagnostic.database.collectionCounts[collection] = -1; // Error counting
        }
      }
    } catch (collectionsError) {
      diagnostic.connection.details.collectionsError = String(collectionsError);
    }
    
    console.log('[mongodb-debug] ✅ All tests passed!');
    
  } catch (error) {
    console.error('[mongodb-debug] ❌ Connection failed:', error);
    
    diagnostic.connection.status = 'connection_failed';
    diagnostic.connection.error = error instanceof Error ? error.message : String(error);
    diagnostic.connection.details = {
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorCode: (error as any)?.code,
      errorCodeName: (error as any)?.codeName,
      errorStack: error instanceof Error ? error.stack : undefined,
    };
    
  } finally {
    // Clean up
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        diagnostic.connection.details.closeError = String(closeError);
      }
    }
  }

  const status = diagnostic.connection.status === 'connected' ? 200 : 500;
  return json(diagnostic, { status });
}