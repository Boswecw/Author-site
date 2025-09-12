// src/routes/api/newsletter/webhook/+server.ts - Webhook for Google Apps Script callbacks

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateSubscriberStatus, getSubscriberByEmail } from '$lib/server/subscribers';

// Simple webhook secret for basic security
const WEBHOOK_SECRET = process.env.NEWSLETTER_WEBHOOK_SECRET || 'your-secret-key-here';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Basic security check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.warn('[webhook] Unauthorized webhook request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, email, status } = await request.json();
    
    console.log('[webhook] Processing:', { action, email: email?.substring(0, 3) + '***', status });

    if (!action || !email) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    switch (action) {
      case 'confirmed':
        await updateSubscriberStatus(normalizedEmail, 'confirmed');
        console.log('[webhook] ✅ Marked as confirmed:', normalizedEmail.substring(0, 3) + '***');
        return json({ success: true, message: 'Subscriber confirmed' });

      case 'unsubscribed':
        await updateSubscriberStatus(normalizedEmail, 'unsubscribed');
        console.log('[webhook] ✅ Marked as unsubscribed:', normalizedEmail.substring(0, 3) + '***');
        return json({ success: true, message: 'Subscriber unsubscribed' });

      case 'resubscribed':
        // Handle someone subscribing again after unsubscribing
        await updateSubscriberStatus(normalizedEmail, 'pending');
        console.log('[webhook] ✅ Marked as pending (resubscribed):', normalizedEmail.substring(0, 3) + '***');
        return json({ success: true, message: 'Subscriber resubscribed' });

      default:
        console.warn('[webhook] Unknown action:', action);
        return json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('[webhook] Error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

// Health check endpoint
export const GET: RequestHandler = async () => {
  return json({ status: 'OK', timestamp: new Date().toISOString() });
};