// src/routes/admin/newsletters/test/+page.server.ts - Email system testing
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { sendTestEmail, validateEmailConfig } from '$lib/server/email';
import { getSubscriberStats } from '$lib/server/subscribers';

export const load: PageServerLoad = async () => {
  try {
    // Validate email configuration
    const emailConfig = validateEmailConfig();
    
    // Get subscriber stats
    const subscriberStats = await getSubscriberStats();

    return {
      emailConfig,
      subscriberStats,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        authorEmail: process.env.AUTHOR_EMAIL || 'Not configured',
        fromEmail: process.env.FROM_EMAIL || 'Not configured'
      }
    };

  } catch (error) {
    console.error('[Email Test] Error loading:', error);
    return {
      emailConfig: { valid: false, missing: ['UNKNOWN'] },
      subscriberStats: { total: 0, confirmed: 0, pending: 0, unsubscribed: 0, newThisWeek: 0, newThisMonth: 0 },
      environment: {
        nodeEnv: 'unknown',
        smtpConfigured: false,
        authorEmail: 'Error loading',
        fromEmail: 'Error loading'
      },
      error: 'Failed to load email configuration'
    };
  }
};

export const actions: Actions = {
  // Send test email
  testEmail: async ({ request }) => {
    try {
      const form = await request.formData();
      const testEmail = String(form.get('testEmail') || '').trim();

      if (!testEmail) {
        return fail(400, { error: 'Test email address is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testEmail)) {
        return fail(400, { error: 'Please enter a valid email address' });
      }

      console.log(`[Email Test] Sending test email to ${testEmail}...`);
      
      const success = await sendTestEmail(testEmail);

      if (success) {
        return { 
          success: true, 
          message: `Test email sent successfully to ${testEmail}. Check your inbox!`,
          testEmail 
        };
      } else {
        return fail(500, { 
          error: 'Failed to send test email. Check server logs for details.' 
        });
      }

    } catch (error) {
      console.error('[Email Test] Error:', error);
      return fail(500, { 
        error: `Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  }
};