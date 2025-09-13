
// src/routes/newsletter/unsubscribe/+page.server.ts
// Unsubscribe page
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { updateSubscriberStatus, getSubscriberByEmail } from '$lib/server/subscribers';

export const load: PageServerLoad = async ({ url }) => {
  const email = url.searchParams.get('email');
  const token = url.searchParams.get('token');

  return {
    email: email || '',
    token: token || '',
    prefilled: !!(email && token)
  };
};

export const actions: Actions = {
  unsubscribe: async ({ request }) => {
    try {
      const formData = await request.formData();
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const reason = String(formData.get('reason') || '').trim();

      if (!email) {
        return fail(400, { error: 'Email address is required' });
      }

      const subscriber = await getSubscriberByEmail(email);
      
      if (!subscriber) {
        return fail(404, { error: 'Email address not found in our system' });
      }

      if (subscriber.status === 'unsubscribed') {
        return {
          success: true,
          message: 'You were already unsubscribed from our newsletter',
          alreadyUnsubscribed: true
        };
      }

      // Update subscriber status
      await updateSubscriberStatus(email, 'unsubscribed');
      
      console.log(`[Newsletter Unsubscribe] ✅ Unsubscribed: ${email.substring(0, 3)}***`);
      
      // Log unsubscribe reason if provided
      if (reason) {
        console.log(`[Newsletter Unsubscribe] Reason: ${reason}`);
      }

      return {
        success: true,
        message: 'Successfully unsubscribed from the newsletter',
        email
      };

    } catch (error) {
      console.error('[Newsletter Unsubscribe] Error:', error);
      return fail(500, { error: 'Failed to unsubscribe. Please try again.' });
    }
  }
};