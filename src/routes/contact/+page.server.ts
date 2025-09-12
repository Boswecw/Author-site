// src/routes/contact/+page.server.ts - Complete file with URL cleanup
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

// Clean up the environment variable (remove any extra text)
function cleanAppsScriptUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  
  // Remove any "APPS_SCRIPT_URL = " prefix and trim whitespace/newlines
  const cleaned = rawUrl
    .replace(/^APPS_SCRIPT_URL\s*=\s*/, '') // Remove "APPS_SCRIPT_URL = "
    .replace(/[\r\n]+/g, '') // Remove newlines
    .trim(); // Remove surrounding whitespace
  
  return cleaned || undefined;
}

// Use the cleaned URL
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

  // Newsletter subscribe action
  subscribe: async (event: RequestEvent) => {
    console.log('[subscribe] Starting newsletter subscription...');
    
    try {
      const form = await event.request.formData();

      console.log('[subscribe] Form data:', {
        email: form.get('email'),
        name: form.get('name'),
        website: form.get('website'),
        source: form.get('source')
      });

      // Honeypot spam protection
      if (String(form.get('website') || '')) {
        console.warn('[subscribe] Honeypot triggered - likely spam');
        return { success: true, message: 'Thanks!' };
      }

      const name = String(form.get('name') || '').trim();
      const email = String(form.get('email') || '').trim().toLowerCase();

      console.log('[subscribe] Processing:', { email: email.substring(0, 3) + '***', name });

      // Validation
      if (!EMAIL_RE.test(email)) {
        console.log('[subscribe] Invalid email format');
        return fail(400, { error: 'Enter a valid email address.' });
      }

      // Environment check (now using cleaned URL)
      console.log('[subscribe] Environment check:', {
        hasAppsScriptUrl: !!APPS_SCRIPT_URL,
        urlLength: APPS_SCRIPT_URL?.length || 0,
        cleanedUrl: APPS_SCRIPT_URL?.substring(0, 50) + '...', // Show first 50 chars
        nodeEnv: process.env.NODE_ENV
      });

      if (!APPS_SCRIPT_URL) {
        console.error('[subscribe] APPS_SCRIPT_URL missing or invalid after cleanup');
        return fail(500, { error: 'Newsletter service unavailable.' });
      }

      // Call Google Apps Script with cleaned URL
      const requestUrl = `${APPS_SCRIPT_URL}?route=subscribe`;
      const requestBody = new URLSearchParams({ email, name, source: 'contact-modal' });

      console.log('[subscribe] Calling Apps Script:', requestUrl);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: requestBody
      });

      console.log('[subscribe] Apps Script response:', {
        status: response.status,
        ok: response.ok
      });

      // Handle response
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

      console.log('[subscribe] Success!', data.message);
      return { success: true, message: data.message || 'Subscribed! Check your email to confirm.' };

    } catch (err) {
      console.error('[subscribe] Unexpected error:', err);
      return fail(500, { error: 'Subscription failed. Please try again.' });
    }
  }
};