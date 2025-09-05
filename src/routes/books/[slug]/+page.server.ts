// src/routes/books/[slug]/+page.server.ts - FIXED TYPES
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/types';

// ✅ FIXED: Proper TypeScript typing
export async function load({ params }: { params: { slug: string } }) {
  try {
    const db = await getDb();
    const coll = db.collection<BookDoc>('books');

    const book = await coll.findOne(
      { id: params.slug },
      {
        projection: {
          _id: 0,
          id: 1,
          title: 1,
          description: 1,
          cover: 1,
          genre: 1,
          status: 1,
          publishDate: 1,
          isbn: 1,
          format: 1,
          pages: 1,
          buyLinks: 1,
          links: 1
        }
      }
    );

    if (!book) {
      // Placeholder books for development
      const placeholderBooks: Record<string, any> = {
        'faith-in-a-firestorm': {
          id: 'faith-in-a-firestorm',
          title: 'Faith in a Firestorm',
          description: 'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
          cover: 'books/Faith_in_a_FireStorm.png',
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-09-01',
          pages: 320,
          format: 'ebook, paperback'
        },
        'conviction-in-a-flood': {
          id: 'conviction-in-a-flood',
          title: 'Conviction in a Flood',
          description: 'When disaster strikes, faith and determination are the only things standing between hope and despair.',
          cover: 'books/Conviction_in_a_Flood.png',
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-12-01',
          pages: 300,
          format: 'ebook, paperback'
        }
      };

      const placeholderBook = placeholderBooks[params.slug];
      
      if (!placeholderBook) {
        throw error(404, 'Book not found');
      }

      return { book: placeholderBook };
    }

    return { book };
  } catch (err) {
    console.error('[books/slug] Load error:', params.slug, err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to load book details');
  }
}