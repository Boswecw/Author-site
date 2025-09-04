// src/routes/contact/+page.server.ts
export const prerender = false;
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

// CRITICAL FIX: Add minimal load function to prevent 500 during preload
export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() ?? '';
    const email = formData.get('email')?.toString() ?? '';
    const subject = formData.get('subject')?.toString() ?? '';
    const message = formData.get('message')?.toString() ?? '';
    
    // Honeypot spam protection
    const website = formData.get('website')?.toString();
    if (website) {
      // Silent failure for bots
      return fail(400, { message: 'Invalid submission.' });
    }

    // Basic validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return fail(400, { 
        message: 'All fields are required.',
        values: { name, email, subject, message }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, { 
        message: 'Please enter a valid email address.',
        values: { name, email, subject, message }
      });
    }

    // CRITICAL FIX: Guard environment variables gracefully
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailPassword) {
      console.error('[contact] Missing email configuration');
      return fail(500, { 
        message: 'Email service is not configured. Please try again later.',
        values: { name, email, subject, message }
      });
    }

    try {
      // CRITICAL FIX: Import nodemailer inside the action to prevent build issues
      const nodemailer = await import('nodemailer');

      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword
        }
      });

      await transporter.sendMail({
        from: `"Author Website" <${gmailUser}>`,
        to: gmailUser,
        subject: `New Contact Form: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #dc2626;">New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `
      });

      return { 
        success: true, 
        message: 'Thanks — your message has been sent. I\'ll get back to you soon!' 
      };
    } catch (err) {
      console.error('[contact] email sending error:', err);
      return fail(500, { 
        message: 'Failed to send message. Please try again later.',
        values: { name, email, subject, message }
      });
    }
  }
};