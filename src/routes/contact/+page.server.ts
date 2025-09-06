// src/routes/contact/+page.server.ts
export const prerender = false;

import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => ({});

// tiny helpers
const t = (v: string | undefined) => (v ?? '').trim();
const isGmailPlaceholder = (u: string) => u.includes('yourgmailaddress@gmail.com');

export const actions: Actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const name = t(fd.get('name')?.toString());
    const email = t(fd.get('email')?.toString());
    const subject = t(fd.get('subject')?.toString());
    const message = t(fd.get('message')?.toString());
    const website = t(fd.get('website')?.toString()); // honeypot

    // Honeypot
    if (website) return { success: true, message: 'Thanks!' };

    // Validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !subject || !message) {
      return fail(400, { message: 'All fields are required.', values: { name, email, subject, message } });
    }
    if (!emailRe.test(email)) {
      return fail(400, {
        message: 'Please enter a valid email address.',
        values: { name, email, subject, message },
        errors: { email: 'Invalid email.' }
      });
    }

    // ---- Env (TRIMMED) ----
    // Primary: explicit SMTP_* keys (recommended)
    const SMTP_HOST = t(env.SMTP_HOST) || 'smtp.gmail.com';
    const SMTP_PORT = Number(t(env.SMTP_PORT) || '587'); // 587 STARTTLS (recommended)
    const SMTP_USER = t(env.SMTP_USER);
    const SMTP_PASS = t(env.SMTP_PASS);

    // Headers (From/To)
    const EMAIL_FROM = t(env.EMAIL_FROM) || (SMTP_USER ? `Charles Boswell <${SMTP_USER}>` : '');
    const EMAIL_TO = t(env.EMAIL_TO) || SMTP_USER;

    // Guard: refuse placeholder/wrong configuration
    if (!SMTP_USER || !SMTP_PASS || isGmailPlaceholder(SMTP_USER)) {
      console.error('[contact] Missing/placeholder SMTP credentials.', {
        host: SMTP_HOST,
        port: SMTP_PORT,
        user: SMTP_USER || '(empty)'
      });
      return {
        success: false,
        message:
          'Email temporarily unavailable (server not configured). Please email me directly at charlesboswell@boswellwebdevelopment.com.',
        values: { name, email, subject, message }
      };
    }

    // Guard: Gmail app password must be 16 chars, letters only (no spaces)
    if (/gmail\.com$/i.test(SMTP_USER) && !/^[a-zA-Z0-9]{16}$/.test(SMTP_PASS)) {
      console.error('[contact] Gmail app password looks invalid (must be 16 chars, no spaces).');
      return {
        success: false,
        message:
          'Email temporarily unavailable (bad credentials). Please email me directly at charlesboswell@boswellwebdevelopment.com.',
        values: { name, email, subject, message }
      };
    }

    try {
      const nodemailer = await import('nodemailer');

      // Choose STARTTLS (587) or SSL (465) based on port
      const useSSL = SMTP_PORT === 465;
      const transporter = nodemailer.default.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: useSSL,          // true for 465, false for 587
        requireTLS: !useSSL,     // enforce STARTTLS on 587
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        // enable minimal debug without leaking message content
        logger: true
      });

      console.log('[contact] Using SMTP:', { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER });

      // Verify once per boot is enough; if noisy, you can remove later
      await transporter.verify();

      await transporter.sendMail({
        from: EMAIL_FROM || SMTP_USER,
        to: EMAIL_TO || SMTP_USER,
        replyTo: { name, address: email },
        subject: `New Contact Form: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #dc2626; margin: 0 0 8px;">New Contact Form Submission</h2>
            <p style="margin: 0 0 6px;"><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p style="margin: 0 0 12px;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 1px solid #e5e7eb; margin: 16px 0;">
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">
              ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
          </div>
        `
      });

      return { success: true, message: "Thanks — your message has been sent. I'll get back to you soon!" };
    } catch (err) {
      console.error('[contact] email sending error:', err);
      return {
        success: false,
        message:
          'Failed to send via mail server. Please email me directly at charlesboswell@boswellwebdevelopment.com.',
        values: { name, email, subject, message }
      };
    }
  }
};
