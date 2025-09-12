// src/routes/admin/subscribers/+page.server.ts
import type { PageServerLoad } from './$types';
import {
  getSubscriberStats,
  getRecentSubscribers,
  searchSubscribers
} from '$lib/server/subscribers';

export const prerender = false; // keep admin SSR

export const load: PageServerLoad = async ({ url, depends, setHeaders /*, locals*/ }) => {
  depends('admin:subscribers');
  setHeaders({ 'cache-control': 'no-store' });

  const search = (url.searchParams.get('search') || '').trim();
  const rawLimit = Number(url.searchParams.get('limit'));
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 50;

  try {
    const [stats, subscribers] = await Promise.all([
      getSubscriberStats(),
      search ? searchSubscribers(search, limit) : getRecentSubscribers(limit)
    ]);

    return { stats, subscribers, search, success: true as const };
  } catch (e) {
    console.error('[admin/subscribers] Error loading data:', e);
    return {
      stats: { total: 0, confirmed: 0, pending: 0, unsubscribed: 0, newThisWeek: 0, newThisMonth: 0 },
      subscribers: [],
      search,
      error: 'Failed to load subscriber data',
      success: false as const
    };
  }
};
