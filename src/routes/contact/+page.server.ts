// src/routes/contact/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL; // must be the /exec URL

export const actions: Actions = {
  // Contact message (your existing handler)
  default: async ({ request }) => {
    try {
      const form = await request.formData();
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

      // If you still want to forward via SMTP, keep your Nodemailer code here.
      // Otherwise, just pretend-send and return success:
      return { success: true, message: 'Message sent successfully!' };
    } catch (err) {
      console.error('[contact default] error', err);
      return fail(500, { error: 'Failed to send message' });
    }
  },

  // 🔔 Newsletter subscribe (what your modal posts to with action="?/subscribe")
  subscribe: async ({ request }) => {
    try {
      const form = await request.formData();

      // Honeypot (spam trap)
      if (String(form.get('website') || '')) {
        return { success: true, message: 'Thanks!' };
      }

      const name = String(form.get('name') || '').trim();
      const email = String(form.get('email') || '').trim();

      if (!email) return fail(400, { error: 'Email required' });
      if (!APPS_SCRIPT_URL) {
        console.error('APPS_SCRIPT_URL missing');
        return fail(500, { error: 'Server misconfigured. Try again later.' });
      }

      const res = await fetch(`${APPS_SCRIPT_URL}?route=subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, name, source: 'contact-modal' })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const msg = data?.error || `Subscribe failed (${res.status})`;
        return fail(res.status === 429 ? 429 : 500, { error: msg });
      }

      return { success: true, message: data.message || 'Subscribed! Check your email to confirm.' };
    } catch (err) {
      console.error('[contact subscribe] error', err);
      return fail(500, { error: 'Subscription failed. Please try again.' });
    }
  }
};
