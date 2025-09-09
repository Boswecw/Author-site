// src/routes/contact/+page.server.ts - FIXED method name
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    try {
      const formData = await request.formData();
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');

      // Validation
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

      // ✅ FIXED: Use createTransport instead of createTransporter
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({  // ✅ FIXED
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@example.com',
        to: process.env.CONTACT_EMAIL || 'contact@example.com',
        subject: `Contact Form: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/\n/g, '<br>')}</p>
        `
      });

      return { success: true, message: 'Message sent successfully!' };
    } catch (error) {
      console.error('[contact] Send error:', error);
      return fail(500, { error: 'Failed to send message' });
    }
  }
};