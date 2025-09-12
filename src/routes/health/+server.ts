// src/routes/health/+server.ts - Enhanced health check for debugging
import { json } from '@sveltejs/kit';
import { checkDbHealth } from '$lib/server/db';
import { getSubscriberStats } from '$lib/server/subscribers';

export async function GET() {
  console.log('[health] 🏥 Enhanced health check starting...');
  
  const startTime = Date.now();
  const result = {
    status: 'ok',
    healthy: true,
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      renderService: process.env.RENDER_SERVICE_NAME || null
    },
    configuration: {
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoDbName: process.env.MONGODB_DB || 'NOT_SET',
      uriHost: process.env.MONGODB_URI ? 
        new URL(process.env.MONGODB_URI).hostname : 'NOT_PROVIDED'
    },
    database: {
      connected: false,
      connectionTime: null as number | null,
      error: null as string | null
    },
    subscribers: {
      total: 0,
      confirmed: 0,
      error: null as string | null
    },
    performance: {
      totalTime: null as number | null
    }
  };

  // Test MongoDB connection
  try {
    const dbStartTime = Date.now();
    const healthResult = await checkDbHealth();
    result.database.connectionTime = Date.now() - dbStartTime;
    result.database.connected = healthResult.connected;
    
    if (!healthResult.connected) {
      result.database.error = healthResult.error || 'Connection failed';
      result.healthy = false;
      result.status = 'error';
    }
  } catch (error) {
    result.database.error = error instanceof Error ? error.message : String(error);
    result.healthy = false;
    result.status = 'error';
  }

  // Test subscriber functionality (if DB is connected)
  if (result.database.connected) {
    try {
      const stats = await getSubscriberStats();
      result.subscribers.total = stats.total;
      result.subscribers.confirmed = stats.confirmed;
    } catch (error) {
      result.subscribers.error = error instanceof Error ? error.message : String(error);
      console.warn('[health] Subscriber stats failed but DB connected:', error);
      // Don't mark as unhealthy for subscriber issues
    }
  }

  result.performance.totalTime = Date.now() - startTime;

  console.log(`[health] ${result.healthy ? '✅' : '❌'} Health check completed in ${result.performance.totalTime}ms`);
  console.log(`[health] Subscribers: ${result.subscribers.total} total, ${result.subscribers.confirmed} confirmed`);

  return json(result, { 
    status: result.healthy ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json'
    }
  });
}