// src/routes/books/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { getBookById } from '$lib/server/books';

export const load: PageServerLoad = async ({ params }) => {
  const book = await getBookById(params.id);
  return { book };
};
