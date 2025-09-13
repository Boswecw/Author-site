
// src/routes/newsletter/confirm/+page.server.ts
// Confirmation page for newsletter subscriptions
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { updateSubscriberStatus, getSubscriberByEmail } from '$lib/server/subscribers';

export const load: PageServerLoad = async ({ url }) => {
  const email = url.searchParams.get('email');
  const token = url.searchParams.get('token');

  if (!email || !token) {
    throw error(400, 'Invalid confirmation link');
  }

  try {
    console.log(`[Newsletter Confirm] Processing: ${email.substring(0, 3)}***`);

    // Find subscriber in MongoDB
    const subscriber = await getSubscriberByEmail(email);
    
    if (!subscriber) {
      throw error(404, 'Subscriber not found');
    }

    if (subscriber.status === 'confirmed') {
      return {
        alreadyConfirmed: true,
        email,
        name: subscriber.name
      };
    }

    // Update subscriber status to confirmed
    await updateSubscriberStatus(email, 'confirmed');
    
    console.log(`[Newsletter Confirm] ✅ Confirmed: ${email.substring(0, 3)}***`);

    return {
      confirmed: true,
      email,
      name: subscriber.name
    };

  } catch (err) {
    console.error('[Newsletter Confirm] Error:', err);
    
    if (err instanceof Error && err.message.includes('not found')) {
      throw error(404, 'Subscriber not found');
    }
    
    throw error(500, 'Failed to confirm subscription');
  }
};