// src/routes/contact/+page.server.ts
export const prerender = false;

import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => ({});

export const actions: Actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const name = fd.get('name')?.toString() ?? '';
    const email = fd.get('email')?.toString() ?? '';
    const subject = fd.get('subject')?.toString() ?? '';
    const message = fd.get('message')?.toString() ?? '';
    const website = fd.get('website')?.toString();

    // Honeypot
    if (website) return { success: true, message: 'Thanks!' };

    // Validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return fail(400, { message: 'All fields are required.', values: { name, email, subject, message } });
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return fail(400, {
        message: 'Please enter a valid email address.',
        values: { name, email, subject, message },
        errors: { email: 'Invalid email.' }
      });
    }

    // Workspace sender + App Password
    const gmailUser = env.GMAIL_USER;
    const gmailPass = env.GMAIL_APP_PASSWORD;

    // Who the email appears from / goes to
    const emailFrom = env.EMAIL_FROM ?? (gmailUser ? `Author Website <${gmailUser}>` : undefined);
    const emailTo = env.EMAIL_TO ?? gmailUser;

    if (!gmailUser || !gmailPass) {
      console.warn('[contact] Missing email configuration. Message NOT sent.', {
        from: { name, email },
        subject
      });
      return {
        success: false,
        message: 'Email temporarily unavailable. Please email me directly.',
        values: { name, email, subject, message }
      };
    }

    try {
      const nodemailer = await import('nodemailer');

      // Explicit Gmail SMTP (Workspace)
      const transporter = nodemailer.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL
        auth: { user: gmailUser, pass: gmailPass }
      });

      // Optional: sanity check during setup (remove after it passes once)
      await transporter.verify();

      await transporter.sendMail({
        from: emailFrom ?? gmailUser,        // must be your Workspace address or an approved alias
        to: emailTo ?? gmailUser,
        replyTo: { name, address: email },   // reply directly to the sender
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

      return { success: true, message: "Thanks — your message has been sent. I'll get back to you soon!" };
    } catch (err) {
      console.error('[contact] email sending error:', err);
      return {
        success: false,
        message: 'Failed to send message. Please email me directly.',
        values: { name, email, subject, message }
      };
    }
  }
};
