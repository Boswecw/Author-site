// src/routes/api/newsletter/create/+server.ts - Template 2 Version
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { enhanceNewsletterTemplate2 } from '$lib/server/email-template-2';

const API_KEY = process.env.NEWSLETTER_WEBHOOK_SECRET || 'your-secret-key';

interface NewsletterData {
  googleDocId: string;
  googleDocUrl: string;
  fileName: string;
  subject: string;
  preheader?: string;
  content: {
    html: string;
    text: string;
  };
  metadata?: any;
  status: 'draft' | 'ready' | 'sent';
  createdAt: string;
  processedAt: string;
  template?: string; // NEW: Track which template was used
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('[Newsletter API] 📧 Processing newsletter with Template 2...');

    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData: NewsletterData = await request.json();
    
    // Validate required fields
    if (!rawData.subject || !rawData.content?.html) {
      return json({ 
        error: 'Missing required fields: subject and content are required' 
      }, { status: 400 });
    }

    console.log(`[Newsletter API] Processing with Template 2: "${rawData.subject}"`);

    // 🎨 ENHANCED: Process content through Template 2 system
    const enhancedNewsletter = await enhanceNewsletterTemplate2(rawData);
    
    console.log('[Newsletter API] ✨ Enhanced content with Template 2');

    const db = await getDb();
    const collection = db.collection('newsletters');

    // Create enhanced newsletter document
    const newsletter = {
      googleDocId: enhancedNewsletter.googleDocId,
      googleDocUrl: enhancedNewsletter.googleDocUrl,
      fileName: enhancedNewsletter.fileName,
      subject: enhancedNewsletter.subject,
      preheader: enhancedNewsletter.preheader || '',
      content: enhancedNewsletter.content,
      metadata: {
        ...enhancedNewsletter.metadata,
        template: 'template-2',
        processedWith: 'enhanced-template-2'
      },
      status: enhancedNewsletter.status || 'ready',
      slug: generateSlug(enhancedNewsletter.subject),
      template: 'template-2', // NEW: Template identifier
      source: 'google-docs-template-2',
      createdAt: new Date(enhancedNewsletter.createdAt),
      processedAt: new Date(),
      sentAt: enhancedNewsletter.status === 'sent' ? new Date() : null,
      updatedAt: new Date()
    };

    // Check if newsletter already exists
    const existing = await collection.findOne({ 
      googleDocId: enhancedNewsletter.googleDocId 
    });

    let result;
    if (existing) {
      // Update existing newsletter
      result = await collection.updateOne(
        { googleDocId: enhancedNewsletter.googleDocId },
        { $set: { ...newsletter, updatedAt: new Date() } }
      );
      
      console.log(`[Newsletter API] ✅ Updated existing newsletter: ${newsletter.subject}`);
      
      return json({
        success: true,
        message: 'Newsletter updated with Template 2',
        newsletterId: existing._id,
        action: 'updated',
        template: 'template-2',
        preview: {
          subject: newsletter.subject,
          preheader: newsletter.preheader,
          template: 'template-2',
          source: newsletter.source
        }
      });
    } else {
      // Create new newsletter
      result = await collection.insertOne(newsletter);
      
      console.log(`[Newsletter API] ✅ Created new Template 2 newsletter: ${newsletter.subject}`);
      
      return json({
        success: true,
        message: 'Newsletter created with Template 2',
        newsletterId: result.insertedId,
        action: 'created',
        template: 'template-2',
        preview: {
          subject: newsletter.subject,
          preheader: newsletter.preheader,
          template: 'template-2',
          source: newsletter.source
        }
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

/**
 * Manual newsletter creation with Template 2
 */
export const PUT: RequestHandler = async ({ request }) => {
  try {
    console.log('[Newsletter API] 📝 Creating manual newsletter with Template 2...');

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      subject, 
      featuredStory, 
      topStories, 
      preheader, 
      status = 'draft' 
    } = await request.json();

    if (!subject || !featuredStory?.headline) {
      return json({ 
        error: 'Missing required fields: subject and featured story are required' 
      }, { status: 400 });
    }

    // Import Template 2 renderer
    const { renderTemplate2 } = await import('$lib/server/email-template-2');

    // Render through Template 2 system
    const rendered = await renderTemplate2({
      subject,
      preheader: preheader || '',
      featuredStory: {
        headline: featuredStory.headline,
        content: featuredStory.content || '',
        author: featuredStory.author || 'Charles W. Boswell',
        date: featuredStory.date || new Date().toISOString()
      },
      topStories: topStories || []
    });

    const db = await getDb();
    const newsletter = {
      subject,
      preheader: preheader || '',
      content: {
        html: rendered.html,
        text: rendered.text
      },
      status,
      slug: generateSlug(subject),
      template: 'template-2',
      source: 'manual-template-2',
      createdAt: new Date(),
      processedAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        template: 'template-2',
        featuredStory,
        topStories: topStories || []
      }
    };

    const result = await db.collection('newsletters').insertOne(newsletter);

    console.log(`[Newsletter API] ✅ Created manual Template 2 newsletter: ${subject}`);

    return json({
      success: true,
      message: 'Manual newsletter created with Template 2',
      newsletterId: result.insertedId,
      template: 'template-2',
      preview: {
        subject: newsletter.subject,
        preheader: newsletter.preheader,
        template: 'template-2',
        source: newsletter.source
      }
    });

  } catch (error) {
    console.error('[Newsletter API] Manual Template 2 creation error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create newsletter'
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