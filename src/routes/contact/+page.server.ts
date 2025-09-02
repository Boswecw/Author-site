// src/routes/contact/+page.server.ts
import type { Actions } from './$types';
import nodemailer from 'nodemailer';
import { fail } from '@sveltejs/kit';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'charlesboswell@boswellwebdevelopment.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() ?? '';
    const email = formData.get('email')?.toString() ?? '';
    const subject = formData.get('subject')?.toString() ?? '';
    const message = formData.get('message')?.toString() ?? '';

    try {
      await transporter.sendMail({
        from: `"Author Website" <charlesboswell@boswellwebdevelopment.com>`,
        to: 'charlesboswell@boswellwebdevelopment.com',
        subject: `New Contact Form: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
               <p><strong>Subject:</strong> ${subject}</p>
               <p>${message.replace(/\n/g, '<br>')}</p>`
      });

      return { success: true, message: 'Thanks — your message has been sent.' };
    } catch (err) {
      console.error('[contact] email error:', err);
      return fail(500, { error: 'Failed to send email. Please try again later.' });
    }
  }
};
