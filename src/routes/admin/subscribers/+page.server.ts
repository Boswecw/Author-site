// src/routes/admin/subscribers/+page.server.ts - Simple Working Version
import {
  getSubscriberStats,
  getRecentSubscribers,
  searchSubscribers
} from '$lib/server/subscribers';

export const prerender = false;

// Simple version that bypasses TypeScript issues
export async function load(event: any) {
  const { url, depends, setHeaders } = event;
  
  depends('admin:subscribers');
  setHeaders({ 'cache-control': 'no-store' });

  const search = (url.searchParams.get('search') || '').trim();
  const rawLimit = Number(url.searchParams.get('limit'));
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 50;

  console.log('[admin/subscribers] Loading subscriber data...', { search, limit });

  try {
    const [stats, subscribers] = await Promise.all([
      getSubscriberStats(),
      search ? searchSubscribers(search, limit) : getRecentSubscribers(limit)
    ]);

    console.log('[admin/subscribers] ✅ Raw data loaded:', {
      statsTotal: stats.total,
      subscribersCount: subscribers.length
    });

    // 🔥 FIX: Convert MongoDB ObjectIds to strings for serialization
    const serializedSubscribers = subscribers.map((sub: any) => ({
      ...sub,
      _id: sub._id?.toString(), // Convert ObjectId to string
      createdAt: sub.createdAt instanceof Date ? sub.createdAt.toISOString() : sub.createdAt,
      updatedAt: sub.updatedAt instanceof Date ? sub.updatedAt.toISOString() : sub.updatedAt,
      confirmedAt: sub.confirmedAt instanceof Date ? sub.confirmedAt.toISOString() : sub.confirmedAt,
      unsubscribedAt: sub.unsubscribedAt instanceof Date ? sub.unsubscribedAt.toISOString() : sub.unsubscribedAt,
    }));

    console.log('[admin/subscribers] ✅ Data serialized successfully');

    return { 
      stats, 
      subscribers: serializedSubscribers, 
      search, 
      success: true as const 
    };
    
  } catch (e) {
    console.error('[admin/subscribers] ❌ Error loading data:', e);
    
    return {
      stats: { 
        total: 0, 
        confirmed: 0, 
        pending: 0, 
        unsubscribed: 0, 
        newThisWeek: 0, 
        newThisMonth: 0 
      },
      subscribers: [],
      search,
      error: `Failed to load subscriber data: ${e instanceof Error ? e.message : String(e)}`,
      success: false as const
    };
  }
}