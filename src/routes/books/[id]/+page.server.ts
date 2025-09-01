// src/routes/books/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getBookById } from '$lib/server/books';

export const load: PageServerLoad = async ({ params }) => {
  const book = await getBookById(params.id);
  if (!book) throw error(404, 'Book not found');
  return { book };
};
