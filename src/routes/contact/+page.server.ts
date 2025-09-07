export const prerender = false;

import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => ({});

function maskEmail(email?: string) {
  if (!email) return 'undefined';
  const [u, d] = email.split('@');
  if (!d) return 'invalid';
  const head = u.slice(0, 2);
  const tail = u.slice(-1);
  return `${head}${'*'.repeat(Math.max(1, u.length - 3))}${tail}@${d}`;
}

export const actions: Actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const name = fd.get('name')?.toString() ?? '';
    const email = fd.get('email')?.toString() ?? '';
    const subject = fd.get('subject')?.toString() ?? '';
    const message = fd.get('message')?.toString() ?? '';
    const website = fd.get('website')?.toString(); // honeypot

    if (website) return { success: true, message: 'Thanks!' };

    // Basic validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return fail(400, { message: 'All fields are required.', values: { name, email, subject, message } });
    }
    if (!emailRe.test(email)) {
      return fail(400, {
        message: 'Please enter a valid email address.',
        values: { name, email, subject, message },
        errors: { email: 'Invalid email.' }
      });
    }

    // Config
    const SMTP_HOST = env.SMTP_HOST ?? 'smtp.gmail.com';
    const SMTP_PORT = Number(env.SMTP_PORT ?? 587);
    const SMTP_USER = env.SMTP_USER;
    const SMTP_PASS = env.SMTP_PASS;
    const EMAIL_FROM = env.EMAIL_FROM ?? (SMTP_USER ? `Charles Boswell <${SMTP_USER}>` : undefined);
    const EMAIL_TO = env.EMAIL_TO ?? SMTP_USER;

    // Debug (opt-in with CONTACT_DEBUG=1)
    const DEBUG = env.CONTACT_DEBUG === '1' || env.CONTACT_DEBUG === 'true';
    if (DEBUG) {
      console.log('[contact][debug] Running on', process.env.NETLIFY ? 'Netlify' : 'Local');
      console.log('[contact][debug] SMTP_HOST:', SMTP_HOST);
      console.log('[contact][debug] SMTP_PORT:', SMTP_PORT);
      console.log('[contact][debug] SMTP_USER:', maskEmail(SMTP_USER));
      console.log('[contact][debug] SMTP_PASS length:', SMTP_PASS ? SMTP_PASS.length : 'undefined');
      console.log('[contact][debug] EMAIL_FROM:', EMAIL_FROM);
      console.log('[contact][debug] EMAIL_TO:', EMAIL_TO);
    }

    // Hard guards
    if (!SMTP_USER || !SMTP_PASS) {
      if (DEBUG) console.warn('[contact][debug] Missing SMTP_USER or SMTP_PASS; aborting send.');
      return {
        success: false,
        message: 'Email temporarily unavailable. Please email me directly.',
        values: { name, email, subject, message }
      };
    }

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for 587 STARTTLS
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      });

      // This verifies connection + auth without sending email
      try {
        await transporter.verify();
        if (DEBUG) console.log('[contact][debug] transporter.verify() OK');
      } catch (vErr: any) {
        console.error('[contact] verify failed:', vErr?.code ?? vErr?.message ?? vErr);
        return {
          success: false,
          message:
            'Email service failed verification. Please email me directly while I fix this.',
          values: { name, email, subject, message }
        };
      }

      await transporter.sendMail({
        from: EMAIL_FROM ?? SMTP_USER,
        to: EMAIL_TO ?? SMTP_USER,
        replyTo: { name, address: email },
        subject: `New Contact Form: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #dc2626;">New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
              ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
          </div>
        `
      });

      if (DEBUG) console.log('[contact][debug] sendMail OK');
      return { success: true, message: "Thanks — your message has been sent. I'll get back to you soon!" };
    } catch (err: any) {
      // Summarize without leaking secrets
      const summary = {
        code: err?.code,
        responseCode: err?.responseCode,
        command: err?.command,
        // Trim the verbose SMTP text
        response: typeof err?.response === 'string' ? err.response.slice(0, 180) + '…' : undefined
      };
      console.error('[contact] email sending error (summary):', summary);
      return {
        success: false,
        message: 'Failed to send message. Please email me directly.',
        values: { name, email, subject, message }
      };
    }
  }
};
