// src/routes/admin/sync-subscribers/+server.ts - CORRECTED EMAIL ADDRESSES
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
    // ✅ CORRECTED: Using exact email addresses from your Google Sheets
    const googleSheetsData: GoogleSheetsSubscriber[] = [
      {
        email: 'charlieboswell@gmail',  // ✅ NO .com (as in your sheets)
        name: 'Charles Boswell', 
        status: 'confirmed',
        createdAt: '2025-09-12T09:48:41.591Z',
        updatedAt: '2025-09-12T10:15:07.735Z',
        source: 'browser-test'
      },
      {
        email: 'charlieboswell@gmail',  // ✅ NO .com (duplicate entry)
        name: 'Charles Boswell',
        status: 'confirmed', 
        createdAt: '2025-09-12T10:15:42.623Z',
        updatedAt: '2025-09-12T10:16:03.955Z',
        source: 'contact-modal'
      },
      {
        email: 'bosweov@gmail',  // ✅ NO .com (as in your sheets)
        name: 'Charles Boswell',
        status: 'confirmed',
        createdAt: '2025-09-12T10:58:34.059Z', 
        updatedAt: '2025-09-12T10:59:05.755Z',
        source: 'contact-modal'
      }
    ];

    console.log(`[sync] Processing ${googleSheetsData.length} records with CORRECT emails...`);
    
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
          googleSheetsRowId: results.processed + 2
        });

        results.processed++;
        results.details.push({
          email: subscriber.email,
          status: 'success',
          action: 'upserted',
          mongoId: mongoSubscriber?._id?.toString()
        });
        
        console.log(`[sync] ✅ ${subscriber.email} → MongoDB ID: ${mongoSubscriber?._id}`);
        
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

    console.log('[sync] ✅ Sync completed with corrected emails!', {
      processed: results.processed,
      errors: results.errors
    });

    return json({
      success: true,
      message: `Sync completed with corrected emails: ${results.processed} processed, ${results.errors} errors`,
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

export async function GET() {
  return json({ 
    message: 'Use POST to trigger sync with corrected email addresses',
    note: 'This version uses the exact email addresses from Google Sheets (without .com)',
    emails: ['charlieboswell@gmail', 'bosweov@gmail']
  });
}