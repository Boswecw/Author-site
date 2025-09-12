// src/routes/newsletter/resend/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!; // ends with /exec

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const name = String(form.get('name') || '').trim();

    if (!EMAIL_RE.test(email)) {
      return fail(400, { error: 'Enter a valid email address.', values: { email, name } });
    }

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?route=resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, name })
      });

      const data = await res.json();
      if (!data.ok) {
        return fail(429, { error: data.error || 'Too many requests. Try again later.', values: { email, name } });
      }

      return { success: true, message: data.message || 'New confirmation link sent.', values: { email, name } };
    } catch (err) {
      console.error('[resend] error', err);
      return fail(500, { error: 'Something went wrong. Please try again.', values: { email, name } });
    }
  }
};
