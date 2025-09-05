i// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getFeaturedBook, getUpcomingBooks } from '$lib/server/books';

// ✅ Prevent Netlify from prerendering this (avoids DB access at build time)
export const prerender = false;

export const load: LayoutServerLoad = async () => {
  try {
    const [featured, upcoming] = await Promise.all([
      getFeaturedBook(),
      getUpcomingBooks(6)
    ]);

    return {
      featured: featured ?? null,
      upcoming: upcoming ?? [] // normalized cover URLs
    };
  } catch (err) {
    console.error('[layout.server] load failed:', err);
    return { featured: null, upcoming: [] };
  }
};
