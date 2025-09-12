// src/routes/api/newsletter/stats/+server.ts - Public subscriber stats API

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSubscriberStats } from '$lib/server/subscribers';

export const GET: RequestHandler = async () => {
  try {
    const stats = await getSubscriberStats();
    
    // Return only public stats (don't expose sensitive data)
    return json({
      confirmed: stats.confirmed,
      total: stats.total, // Optional: might want to hide this
      newThisMonth: stats.newThisMonth // Optional: for growth indicators
    });
    
  } catch (error) {
    console.error('[api/newsletter/stats] Error:', error);
    
    // Return fallback data instead of error to keep site working
    return json({
      confirmed: 0,
      total: 0,
      newThisMonth: 0
    });
  }
};