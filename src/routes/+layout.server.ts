export const prerender = false;

import type { LayoutServerLoad } from './$types';
import { getFeaturedBook, getUpcomingBooks } from '$lib/server/books';

export const load: LayoutServerLoad = async () => {
  const [featured, upcoming] = await Promise.all([
    getFeaturedBook(),
    getUpcomingBooks(6)
  ]);
  return { featured: featured ?? null, upcoming: upcoming ?? [] };
};
