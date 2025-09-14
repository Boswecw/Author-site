// src/routes/api/newsletter/create/+server.ts
// API endpoint for creating newsletter posts from Google Docs
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

const API_KEY = process.env.NEWSLETTER_WEBHOOK_SECRET || 'your-secret-key';

interface NewsletterData {
  googleDocId: string;
  googleDocUrl: string;
  fileName: string;
  subject: string;
  preheader: string;
  content: {
    html: string;
    text: string;
  };
  metadata: any;
  status: 'draft' | 'ready' | 'sent';
  createdAt: string;
  processedAt: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsletterData: NewsletterData = await request.json();
    
    // Validate required fields
    if (!newsletterData.subject || !newsletterData.content?.html) {
      return json({ 
        error: 'Missing required fields: subject and content are required' 
      }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('newsletters');

    // Create newsletter document
    const newsletter = {
      googleDocId: newsletterData.googleDocId,
      googleDocUrl: newsletterData.googleDocUrl,
      fileName: newsletterData.fileName,
      subject: newsletterData.subject,
      preheader: newsletterData.preheader || '',
      content: newsletterData.content,
      metadata: newsletterData.metadata || {},
      status: newsletterData.status || 'draft',
      slug: generateSlug(newsletterData.subject),
      createdAt: new Date(newsletterData.createdAt),
      processedAt: new Date(newsletterData.processedAt),
      sentAt: newsletterData.status === 'sent' ? new Date() : null,
      updatedAt: new Date()
    };

    // Check if newsletter already exists
    const existing = await collection.findOne({ 
      googleDocId: newsletterData.googleDocId 
    });

    let result;
    if (existing) {
      // Update existing newsletter
      result = await collection.updateOne(
        { googleDocId: newsletterData.googleDocId },
        { $set: { ...newsletter, updatedAt: new Date() } }
      );
      
      console.log(`[Newsletter API] ✅ Updated existing newsletter: ${newsletter.subject}`);
      
      return json({
        success: true,
        message: 'Newsletter updated successfully',
        newsletterId: existing._id,
        action: 'updated'
      });
    } else {
      // Create new newsletter
      result = await collection.insertOne(newsletter);
      
      console.log(`[Newsletter API] ✅ Created new newsletter: ${newsletter.subject}`);
      
      return json({
        success: true,
        message: 'Newsletter created successfully',
        newsletterId: result.insertedId,
        action: 'created'
      });
    }

  } catch (error) {
    console.error('[Newsletter API] Error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}