// src/routes/admin/newsletters/preview/+page.server.ts - FIXED: TypeScript errors
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';

// FIXED: Use the proper SvelteKit PageServerLoad type instead of ./$types
export const load: PageServerLoad = async ({ url }) => {
  try {
    const newsletterId = url.searchParams.get('id');
    const format = url.searchParams.get('format') || 'html';
    
    if (!newsletterId) {
      throw error(400, 'Newsletter ID required');
    }

    const db = await getDb();
    const newslettersCollection = db.collection('newsletters');
    
    const newsletter = await newslettersCollection.findOne({ 
      _id: new ObjectId(newsletterId) 
    });

    if (!newsletter) {
      throw error(404, 'Newsletter not found');
    }

    return {
      newsletter: {
        id: newsletter._id.toString(),
        subject: newsletter.subject,
        preheader: newsletter.preheader || '',
        status: newsletter.status,
        createdAt: newsletter.createdAt,
        googleDocUrl: newsletter.googleDocUrl,
        content: newsletter.content
      },
      format
    };

  } catch (err) {
    console.error('[Newsletter Preview] Error:', err);
    throw error(500, 'Failed to load newsletter preview');
  }
};