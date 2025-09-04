// src/lib/server/db.ts - DATABASE CONNECTION
import { MongoClient, type Db } from 'mongodb';
import { MONGODB_URI, MONGODB_DB } from '$env/static/private';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * ✅ FIXED: Get MongoDB database connection with proper error handling
 */
export async function getDb(): Promise<Db> {
  // Return existing connection if available
  if (db) {
    return db;
  }

  // Validate environment variables
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (!MONGODB_DB) {
    throw new Error('MONGODB_DB environment variable is not set');
  }

  try {
    // Create new client if needed
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log('✅ Connected to MongoDB');
    }

    // Get database
    db = client.db(MONGODB_DB);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error(`Failed to connect to database: ${error}`);
  }
}

/**
 * ✅ Close database connection (for cleanup)
 */
export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ MongoDB connection closed');
  }
}

/**
 * ✅ Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const database = await getDb();
    await database.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}