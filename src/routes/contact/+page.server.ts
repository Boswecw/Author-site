// src/routes/contact/+page.server.ts
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL; // must be full /exec URL
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const actions: Actions = {
  // Contact message (kept minimal here; keep your nodemailer if you want)
  default: async (event: RequestEvent) => {
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

      // stub success (replace with nodemailer if you want)
      return { success: true, message: 'Message sent successfully!' };
    } catch (err) {
      console.error('[contact default] error', err);
      return fail(500, { error: 'Failed to send message' });
    }
  },

  // Newsletter subscribe (modal posts to action="?/subscribe")
  subscribe: async (event: RequestEvent) => {
    try {
      const form = await event.request.formData();

      // Honeypot (spam)
      if (String(form.get('website') || '')) {
        console.warn('[subscribe] Honeypot hit; ignoring');
        return { success: true, message: 'Thanks!' };
      }

      const name = String(form.get('name') || '').trim();
      const email = String(form.get('email') || '').trim().toLowerCase();

      if (!EMAIL_RE.test(email)) return fail(400, { error: 'Enter a valid email address.' });
      if (!APPS_SCRIPT_URL) {
        console.error('[subscribe] APPS_SCRIPT_URL missing');
        return fail(500, { error: 'Server misconfigured. Try again later.' });
      }

      const body = new URLSearchParams({ email, name, source: 'contact-modal' });

      const url = `${APPS_SCRIPT_URL}?route=subscribe`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      // Try JSON first; if that fails, grab text for debugging
      let data: any = null;
      let rawText = '';
      try {
        data = await res.json();
      } catch {
        rawText = await res.text();
        console.error('[subscribe] Non-JSON response from Apps Script:', rawText.slice(0, 500));
      }

      if (!res.ok || !data?.ok) {
        const msg = data?.error || rawText || `Subscribe failed (${res.status})`;
        console.error('[subscribe] Apps Script error', { status: res.status, msg });
        return fail(res.status === 429 ? 429 : 500, { error: msg });
      }

      return { success: true, message: data.message || 'Subscribed! Check your email to confirm.' };
    } catch (err) {
      console.error('[contact subscribe] error', err);
      return fail(500, { error: 'Subscription failed. Please try again.' });
    }
  }
};
