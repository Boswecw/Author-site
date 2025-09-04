// src/lib/server/db.ts
import { MongoClient, type Db } from 'mongodb';
import { MONGODB_URI, MONGODB_DB } from '$env/static/private';
import { dev } from '$app/environment';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;

/**
 * CRITICAL FIX: Safe MongoDB connection with build-time handling
 */
export async function getDb(): Promise<Db> {
  // CRITICAL FIX: Handle missing env vars during build
  if (!MONGODB_URI || !MONGODB_DB) {
    if (dev) {
      console.warn('[getDb] Missing MongoDB environment variables in development');
      throw new Error('MongoDB connection string not configured');
    }
    
    // During build, create a mock db that won't be used
    throw new Error('MongoDB not available during build');
  }

  // Return existing connection
  if (db) return db;

  // Prevent multiple connection attempts
  if (isConnecting) {
    // Wait for existing connection attempt
    let attempts = 0;
    while (isConnecting && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (db) return db;
  }

  isConnecting = true;

  try {
    // CRITICAL FIX: Robust connection with timeout
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: dev ? 10000 : 5000,
      connectTimeoutMS: dev ? 10000 : 5000,
      maxPoolSize: dev ? 5 : 10,
      minPoolSize: 1,
    });

    await client.connect();
    db = client.db(MONGODB_DB);

    console.log(`[getDb] Connected to MongoDB: ${MONGODB_DB}`);
    
    // Test connection
    await db.admin().ping();
    
    return db;
  } catch (error) {
    console.error('[getDb] MongoDB connection failed:', error);
    
    // Clean up failed connection
    if (client) {
      try { await client.close(); } catch {}
      client = null;
    }
    
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isConnecting = false;
  }
}

/**
 * CRITICAL FIX: Graceful connection cleanup
 */
export async function closeDb(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log('[closeDb] MongoDB connection closed');
    } catch (error) {
      console.error('[closeDb] Error closing MongoDB:', error);
    } finally {
      client = null;
      db = null;
    }
  }
}

// CRITICAL FIX: Handle process cleanup
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeDb);
  process.on('SIGTERM', closeDb);
}