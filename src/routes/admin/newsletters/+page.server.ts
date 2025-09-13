
// src/routes/admin/newsletters/+page.server.ts
// Admin page to view newsletters
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  try {
    const db = await getDb();
    const collection = db.collection('newsletters');

    // Get all newsletters, sorted by creation date
    const newsletters = await collection
      .find({}, {
        projection: {
          _id: 1,
          subject: 1,
          preheader: 1,
          status: 1,
          slug: 1,
          createdAt: 1,
          processedAt: 1,
          sentAt: 1,
          googleDocUrl: 1,
          fileName: 1
        }
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Convert ObjectId to string for serialization
    const serializedNewsletters = newsletters.map(newsletter => ({
      ...newsletter,
      id: newsletter._id.toString(),
      _id: undefined
    }));

    return {
      newsletters: serializedNewsletters
    };

  } catch (error) {
    console.error('[Admin Newsletters] Error loading newsletters:', error);
    return {
      newsletters: [],
      error: 'Failed to load newsletters'
    };
  }
};
