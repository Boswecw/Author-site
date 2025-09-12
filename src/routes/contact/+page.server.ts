// src/routes/contact/+page.server.ts - Updated with MongoDB integration
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { upsertSubscriber, getSubscriberByEmail } from '$lib/server/subscribers';

// Clean up the environment variable (remove any extra text)
function cleanAppsScriptUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  
  const cleaned = rawUrl
    .replace(/^APPS_SCRIPT_URL\s*=\s*/, '') // Remove "APPS_SCRIPT_URL = "
    .replace(/[\r\n]+/g, '') // Remove newlines
    .trim(); // Remove surrounding whitespace
  
  return cleaned || undefined;
}

const APPS_SCRIPT_URL = cleanAppsScriptUrl(process.env.APPS_SCRIPT_URL);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const actions: Actions = {
  // Contact form action
  contact: async (event: RequestEvent) => {
    try {
      const form = await event.request.formData();
      const name = String(form.get('name') || '').trim();
      const email = String(form.get('email') || '').trim();
      const subject = String(form.get('subject') || '').trim();
      const message = String(form.get('message') || '').trim();

      if (!name || !email || !message) {
        return fail(400, {
          error: 'Name, email, and message are required',
          errors: {
            name: !name ? 'Name is required' : undefined,
            email: !email ? 'Email is required' : undefined,
            message: !message ? 'Message is required' : undefined
          }
        });
      }

      console.log('[contact] Message received:', { name, email, subject });
      return { success: true, message: 'Message sent successfully!' };
    } catch (err) {
      console.error('[contact] error', err);
      return fail(500, { error: 'Failed to send message' });
    }
  },

  // Newsletter subscribe action with dual write
  subscribe: async (event: RequestEvent) => {
    console.log('[subscribe] Starting newsletter subscription...');
    
    try {
      const form = await event.request.formData();

      // Honeypot spam protection
      if (String(form.get('website') || '')) {
        console.warn('[subscribe] Honeypot triggered - likely spam');
        return { success: true, message: 'Thanks!' };
      }

      const name = String(form.get('name') || '').trim();
      const email = String(form.get('email') || '').trim().toLowerCase();
      const source = String(form.get('source') || 'contact-modal').trim();

      console.log('[subscribe] Processing:', { email: email.substring(0, 3) + '***', name, source });

      // Validation
      if (!EMAIL_RE.test(email)) {
        console.log('[subscribe] Invalid email format');
        return fail(400, { error: 'Enter a valid email address.' });
      }

      // Check if already subscribed in MongoDB
      const existingSubscriber = await getSubscriberByEmail(email);
      if (existingSubscriber?.status === 'confirmed') {
        console.log('[subscribe] Already confirmed in MongoDB');
        // Still sync with Google Apps Script to keep both systems in sync
      }

      // 1. Write to MongoDB first
      console.log('[subscribe] Saving to MongoDB...');
      try {
        const mongoSubscriber = await upsertSubscriber(email, {
          name,
          status: 'pending',
          source,
          // Add request metadata if available
          ipAddress: event.request.headers.get('cf-connecting-ip') || 
                    event.request.headers.get('x-forwarded-for') || 
                    undefined,
          userAgent: event.request.headers.get('user-agent') || undefined
        });
        
        console.log('[subscribe] ✅ Saved to MongoDB:', mongoSubscriber._id);
      } catch (mongoError) {
        console.error('[subscribe] ⚠️ MongoDB write failed:', mongoError);
        // Continue to Google Apps Script even if MongoDB fails
        // This prevents MongoDB issues from breaking the newsletter signup
      }

      // 2. Write to Google Apps Script (existing system)
      if (!APPS_SCRIPT_URL) {
        console.error('[subscribe] APPS_SCRIPT_URL missing');
        return fail(500, { error: 'Newsletter service unavailable.' });
      }

      console.log('[subscribe] Calling Google Apps Script...');
      const requestUrl = `${APPS_SCRIPT_URL}?route=subscribe`;
      const requestBody = new URLSearchParams({ email, name, source });

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: requestBody
      });

      console.log('[subscribe] Apps Script response:', {
        status: response.status,
        ok: response.ok
      });

      // Handle Apps Script response
      let data: any = null;
      try {
        const rawText = await response.text();
        console.log('[subscribe] Raw response:', rawText.slice(0, 200));
        data = JSON.parse(rawText);
        console.log('[subscribe] Parsed JSON:', data);
      } catch (parseError) {
        console.error('[subscribe] Response parsing error:', parseError);
        return fail(500, { error: 'Invalid response from newsletter service.' });
      }

      if (!response.ok || !data?.ok) {
        const errorMsg = data?.error || `Service error (${response.status})`;
        console.error('[subscribe] Apps Script error:', errorMsg);
        return fail(500, { error: 'Subscription failed. Please try again.' });
      }

      console.log('[subscribe] ✅ Both systems updated successfully');
      
      // Return the message from Google Apps Script (handles "already subscribed" cases)
      return { 
        success: true, 
        message: data.message || 'Subscribed! Check your email to confirm.' 
      };

    } catch (err) {
      console.error('[subscribe] Unexpected error:', err);
      return fail(500, { error: 'Subscription failed. Please try again.' });
    }
  }
};