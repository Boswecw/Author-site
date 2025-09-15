// src/routes/admin/newsletters/send/+page.server.ts - Admin interface for sending newsletters
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getConfirmedSubscribers } from '$lib/server/subscribers';
import { sendNewsletter } from '$lib/server/email';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async ({ url }) => {
  try {
    const newsletterId = url.searchParams.get('id');
    
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

    // Get subscriber count
    const subscribers = await getConfirmedSubscribers();

    return {
      newsletter: {
        id: newsletter._id.toString(),
        subject: newsletter.subject,
        preheader: newsletter.preheader || '',
        content: newsletter.content,
        status: newsletter.status,
        createdAt: newsletter.createdAt,
        sentAt: newsletter.sentAt,
        sentStats: newsletter.sentStats,
        googleDocUrl: newsletter.googleDocUrl
      },
      subscriberCount: subscribers.length,
      canSend: newsletter.status !== 'sent' && subscribers.length > 0
    };

  } catch (err) {
    console.error('[Admin Newsletter Send] Error loading:', err);
    throw error(500, 'Failed to load newsletter');
  }
};

export const actions: Actions = {
  // Send test email
  sendTest: async ({ request, url }) => {
    try {
      const newsletterId = url.searchParams.get('id');
      if (!newsletterId) {
        return fail(400, { error: 'Newsletter ID required' });
      }

      const form = await request.formData();
      const testEmail = String(form.get('testEmail') || '').trim();

      if (!testEmail) {
        return fail(400, { error: 'Test email address required' });
      }

      // Get newsletter
      const db = await getDb();
      const newsletter = await db.collection('newsletters').findOne({ 
        _id: new ObjectId(newsletterId) 
      });

      if (!newsletter) {
        return fail(404, { error: 'Newsletter not found' });
      }

      // Send test email
      const newsletterData = {
        subject: `[TEST] ${newsletter.subject}`,
        content: newsletter.content,
        preheader: newsletter.preheader || ''
      };

      const testSubscriber = {
        email: testEmail,
        name: 'Test User',
        status: 'confirmed' as const,
        createdAt: new Date(),
        source: 'admin-test'
      };

      const result = await sendNewsletter(newsletterData, [testSubscriber]);

      if (result.sent > 0) {
        return { 
          success: true, 
          message: `Test email sent successfully to ${testEmail}` 
        };
      } else {
        return fail(500, { 
          error: `Failed to send test email: ${result.errors.join(', ')}` 
        });
      }

    } catch (err) {
      console.error('[Admin] Test email error:', err);
      return fail(500, { error: 'Failed to send test email' });
    }
  },

  // Send newsletter to all subscribers
  sendNewsletter: async ({ request, url }) => {
    try {
      const newsletterId = url.searchParams.get('id');
      if (!newsletterId) {
        return fail(400, { error: 'Newsletter ID required' });
      }

      // Get newsletter
      const db = await getDb();
      const newslettersCollection = db.collection('newsletters');
      const newsletter = await newslettersCollection.findOne({ 
        _id: new ObjectId(newsletterId) 
      });

      if (!newsletter) {
        return fail(404, { error: 'Newsletter not found' });
      }

      if (newsletter.status === 'sent') {
        return fail(400, { error: 'Newsletter already sent' });
      }

      // Get all confirmed subscribers
      const subscribers = await getConfirmedSubscribers();
      
      if (subscribers.length === 0) {
        return fail(400, { error: 'No confirmed subscribers found' });
      }

      // Send newsletter
      const newsletterData = {
        subject: newsletter.subject,
        content: newsletter.content,
        preheader: newsletter.preheader || ''
      };

      console.log(`[Admin] Sending newsletter to ${subscribers.length} subscribers...`);
      const result = await sendNewsletter(newsletterData, subscribers);

      // Update newsletter status
      await newslettersCollection.updateOne(
        { _id: new ObjectId(newsletterId) },
        { 
          $set: { 
            status: 'sent',
            sentAt: new Date(),
            sentStats: {
              totalSubscribers: subscribers.length,
              successful: result.sent,
              failed: result.failed,
              errors: result.errors
            }
          }
        }
      );

      console.log(`[Admin] Newsletter sent: ${result.sent}/${subscribers.length} successful`);

      return { 
        success: true, 
        message: `Newsletter sent to ${result.sent} of ${subscribers.length} subscribers`,
        result 
      };

    } catch (err) {
      console.error('[Admin] Newsletter send error:', err);
      return fail(500, { error: 'Failed to send newsletter' });
    }
  }
};