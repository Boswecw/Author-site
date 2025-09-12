// src/routes/admin/diagnostics/+server.ts
// Enhanced diagnostic utility for MongoDB connection and data verification

import { json } from '@sveltejs/kit';
import { getDb, checkDbHealth } from '$lib/server/db';
import { getSubscriberStats, getRecentSubscribers } from '$lib/server/subscribers';

export async function GET() {
  console.log('[diagnostics] 🔍 Running comprehensive system diagnostic...');
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      workingDir: process.cwd(),
      renderService: process.env.RENDER_SERVICE_NAME || 'not-on-render'
    },
    configuration: {
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoDbName: process.env.MONGODB_DB || 'NOT_SET',
      uriMasked: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@') : 'NOT_PROVIDED'
    },
    connection: {
      status: 'testing',
      healthy: false,
      connectionTime: null as number | null,
      error: null as string | null,
      details: {} as any
    },
    database: {
      collections: [] as string[],
      collectionCounts: {} as Record<string, number>,
      indexes: {} as Record<string, any[]>
    },
    subscribers: {
      stats: null as any,
      sampleData: [] as any[],
      dataIssues: [] as string[]
    }
  };

  // Step 1: Test basic connection health
  try {
    console.log('[diagnostics] Testing MongoDB connection...');
    const startTime = Date.now();
    
    const healthResult = await checkDbHealth();
    diagnostic.connection.connectionTime = Date.now() - startTime;
    diagnostic.connection.healthy = healthResult.connected;
    
    if (!healthResult.connected) {
      diagnostic.connection.error = healthResult.error || 'Unknown connection error';
      diagnostic.connection.status = 'failed';
      return json(diagnostic, { status: 500 });
    }
    
    diagnostic.connection.status = 'connected';
    console.log('[diagnostics] ✅ Connection successful');
    
  } catch (error) {
    diagnostic.connection.error = error instanceof Error ? error.message : String(error);
    diagnostic.connection.status = 'exception';
    console.error('[diagnostics] Connection test failed:', error);
    return json(diagnostic, { status: 500 });
  }

  // Step 2: Database inspection
  try {
    console.log('[diagnostics] Inspecting database structure...');
    const db = await getDb();
    
    // List collections
    const collections = await db.listCollections().toArray();
    diagnostic.database.collections = collections.map(c => c.name);
    
    // Count documents in each collection
    for (const collectionName of diagnostic.database.collections) {
      try {
        const count = await db.collection(collectionName).estimatedDocumentCount();
        diagnostic.database.collectionCounts[collectionName] = count;
        
        // Get indexes for important collections
        if (['subscribers', 'books', 'posts'].includes(collectionName)) {
          const indexes = await db.collection(collectionName).indexes();
          diagnostic.database.indexes[collectionName] = indexes;
        }
      } catch (countError) {
        diagnostic.database.collectionCounts[collectionName] = -1;
        console.warn(`[diagnostics] Could not count ${collectionName}:`, countError);
      }
    }
    
    console.log('[diagnostics] Database collections:', diagnostic.database.collections);
    
  } catch (error) {
    console.error('[diagnostics] Database inspection failed:', error);
    diagnostic.connection.details.dbInspectionError = String(error);
  }

  // Step 3: Subscriber-specific diagnostics
  try {
    console.log('[diagnostics] Testing subscriber functions...');
    
    // Test subscriber stats function
    const stats = await getSubscriberStats();
    diagnostic.subscribers.stats = stats;
    
    // Get sample subscriber data
    const sampleSubscribers = await getRecentSubscribers(5);
    diagnostic.subscribers.sampleData = sampleSubscribers.map(sub => ({
      email: sub.email.substring(0, 3) + '***', // Mask for privacy
      name: sub.name,
      status: sub.status,
      source: sub.source,
      createdAt: sub.createdAt,
      hasConfirmedAt: !!sub.confirmedAt
    }));
    
    // Analyze data issues
    if (stats.total === 0) {
      diagnostic.subscribers.dataIssues.push('No subscribers found in MongoDB - may need data migration');
    }
    
    if (stats.confirmed > 0 && stats.total === stats.confirmed) {
      diagnostic.subscribers.dataIssues.push('All subscribers are confirmed - good data quality');
    }
    
    if (stats.pending > stats.confirmed) {
      diagnostic.subscribers.dataIssues.push('More pending than confirmed - check email confirmation flow');
    }
    
    console.log('[diagnostics] Subscriber stats:', stats);
    
  } catch (error) {
    console.error('[diagnostics] Subscriber diagnostics failed:', error);
    diagnostic.subscribers.dataIssues.push(`Subscriber functions failed: ${error}`);
  }

  // Step 4: Final assessment
  const hasSubscriberCollection = diagnostic.database.collections.includes('subscribers');
  const subscriberCount = diagnostic.database.collectionCounts.subscribers || 0;
  
  if (!hasSubscriberCollection) {
    diagnostic.subscribers.dataIssues.push('subscribers collection does not exist - will be created on first write');
  }
  
  if (hasSubscriberCollection && subscriberCount === 0) {
    diagnostic.subscribers.dataIssues.push('subscribers collection exists but is empty - run data migration');
  }

  console.log('[diagnostics] ✅ Comprehensive diagnostic completed');
  
  return json({
    ...diagnostic,
    summary: {
      connectionWorking: diagnostic.connection.healthy,
      hasSubscriberData: subscriberCount > 0,
      needsMigration: subscriberCount === 0,
      overallHealth: diagnostic.connection.healthy && subscriberCount >= 0 ? 'good' : 'needs-attention'
    }
  });
}