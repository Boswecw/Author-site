import { getFeaturedBook } from '$lib/server/books';

type GenreKey = 'faith' | 'epic';
const toGenre = (v: unknown): GenreKey => (v === 'faith' || v === 'epic' ? v : 'faith');

export const load = async () => {
  try {
    const featured = await getFeaturedBook();
    return { featuredGenre: toGenre((featured as any)?.genre) };
  } catch {
    return { featuredGenre: 'faith' as GenreKey };
  }
};
