// src/routes/admin/sync-subscribers/+server.ts
// One-time migration utility to sync Google Sheets data to MongoDB

import { json } from '@sveltejs/kit';
import { upsertSubscriber } from '$lib/server/subscribers';

interface GoogleSheetsSubscriber {
  email: string;
  name: string;
  status: 'confirmed' | 'pending' | 'unsubscribed';
  createdAt: string;
  updatedAt: string;
  source: string;
}

export async function POST() {
  console.log('[sync] 🔄 Starting Google Sheets → MongoDB sync...');
  
  try {
    // Your existing Google Sheets data (from the screenshot)
    const googleSheetsData: GoogleSheetsSubscriber[] = [
      {
        email: 'charlieboswell@gmail.com',
        name: 'Charles Boswell', 
        status: 'confirmed',
        createdAt: '2025-09-12T09:48:41.591Z',
        updatedAt: '2025-09-12T10:15:07.735Z',
        source: 'browser-test'
      },
      {
        email: 'charlieboswell@gmail.com', // Duplicate - will be merged
        name: 'Charles Boswell',
        status: 'confirmed', 
        createdAt: '2025-09-12T10:15:42.623Z',
        updatedAt: '2025-09-12T10:16:03.955Z',
        source: 'contact-modal'
      },
      {
        email: 'bosweov@gmail.com', 
        name: 'Charles Boswell',
        status: 'confirmed',
        createdAt: '2025-09-12T10:58:34.059Z', 
        updatedAt: '2025-09-12T10:59:05.755Z',
        source: 'contact-modal'
      }
    ];

    console.log(`[sync] Processing ${googleSheetsData.length} records...`);
    
    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    };

    // Process each subscriber
    for (const subscriber of googleSheetsData) {
      try {
        console.log(`[sync] Processing: ${subscriber.email}`);
        
        const mongoSubscriber = await upsertSubscriber(subscriber.email, {
          name: subscriber.name,
          status: subscriber.status,
          source: subscriber.source,
          createdAt: new Date(subscriber.createdAt),
          updatedAt: new Date(subscriber.updatedAt),
          confirmedAt: subscriber.status === 'confirmed' ? new Date(subscriber.updatedAt) : undefined,
          lastSyncedAt: new Date(),
          googleSheetsRowId: results.processed + 2 // Row number in sheets (assuming header row)
        });

        results.processed++;
        results.details.push({
          email: subscriber.email,
          status: 'success',
          action: mongoSubscriber ? 'upserted' : 'created',
          mongoId: mongoSubscriber._id
        });
        
        console.log(`[sync] ✅ ${subscriber.email} → MongoDB ID: ${mongoSubscriber._id}`);
        
      } catch (error) {
        results.errors++;
        results.details.push({
          email: subscriber.email,
          status: 'error', 
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.error(`[sync] ❌ Failed to sync ${subscriber.email}:`, error);
      }
    }

    console.log('[sync] ✅ Sync completed!', {
      processed: results.processed,
      errors: results.errors
    });

    return json({
      success: true,
      message: `Sync completed: ${results.processed} processed, ${results.errors} errors`,
      results
    });

  } catch (error) {
    console.error('[sync] 💥 Sync failed:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Alternative: Get status info
export async function GET() {
  return json({ 
    message: 'Use POST to trigger sync',
    instructions: 'Send POST request to sync Google Sheets data to MongoDB',
    endpoints: {
      sync: 'POST /admin/sync-subscribers',
      diagnostics: 'GET /admin/diagnostics', 
      migration_ui: 'GET /admin/migration'
    }
  });
}