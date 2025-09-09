// src/routes/health/+server.ts - Enhanced health check for Render deployment

import { json } from '@sveltejs/kit';
import { checkDbHealth } from '$lib/server/db';

export async function GET() {
  console.log('[health] 🏥 Starting health check...');
  
  // Environment validation
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  const NODE_ENV = process.env.NODE_ENV;
  
  console.log('[health] 🔧 Environment check:', {
    hasURI: !!MONGODB_URI,
    hasDB: !!MONGODB_DB,
    nodeEnv: NODE_ENV,
    dbName: MONGODB_DB,
    uriStart: MONGODB_URI?.substring(0, 60) + '...',
    platform: process.platform,
    nodeVersion: process.version,
    workingDir: process.cwd()
  });

  // Check for missing environment variables
  if (!MONGODB_URI || !MONGODB_DB) {
    const missingVars = [];
    if (!MONGODB_URI) missingVars.push('MONGODB_URI');
    if (!MONGODB_DB) missingVars.push('MONGODB_DB');
    
    console.error('[health] ❌ Missing environment variables:', missingVars);
    
    return json({
      status: 'error',
      healthy: false,
      database: 'config_error',
      error: `Missing required environment variables: ${missingVars.join(', ')}`,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version
      }
    }, { status: 500 });
  }

  // Test MongoDB connection using our optimized health check
  console.log('[health] 🔌 Testing MongoDB connection...');
  
  try {
    const startTime = Date.now();
    const healthResult = await checkDbHealth();
    const connectionTime = Date.now() - startTime;
    
    if (healthResult.connected) {
      console.log('[health] ✅ MongoDB connection successful!');
      
      return json({
        status: 'ok',
        healthy: true,
        database: healthResult.database,
        connectionTime: `${connectionTime}ms`,
        environment: {
          nodeEnv: NODE_ENV,
          platform: process.platform,
          nodeVersion: process.version,
          workingDir: process.cwd()
        },
        mongodb: {
          database: healthResult.database,
          connected: true
        },
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('[health] ❌ MongoDB connection failed:', healthResult.error);
      
      return json({
        status: 'error',
        healthy: false,
        database: 'connection_failed',
        error: healthResult.error,
        connectionTime: `${connectionTime}ms`,
        environment: {
          nodeEnv: NODE_ENV,
          platform: process.platform,
          nodeVersion: process.version,
          workingDir: process.cwd()
        },
        mongodb: {
          connected: false,
          database: MONGODB_DB,
          errorDetails: healthResult.error
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[health] 💥 Unexpected error during health check:', error);
    
    return json({
      status: 'error',
      healthy: false,
      database: 'health_check_failed',
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      environment: {
        nodeEnv: NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
        workingDir: process.cwd()
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}