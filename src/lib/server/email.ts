// src/lib/server/email.ts - Complete email system with templates
import { createTransporter, FROM_EMAIL } from './mailer';
import { dev } from '$app/environment';
import type { Subscriber } from '$lib/types';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';
const AUTHOR_NAME = process.env.AUTHOR_NAME || 'Your Name';
const AUTHOR_EMAIL = process.env.AUTHOR_EMAIL || FROM_EMAIL;

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NewsletterData {
  subject: string;
  content: {
    html: string;
    text: string;
  };
  preheader?: string;
}

// Email Templates
export const emailTemplates = {
  // Confirmation email when someone subscribes
  confirmation: (name: string, email: string): EmailTemplate => ({
    subject: `Welcome to ${AUTHOR_NAME}'s Newsletter!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .unsubscribe { margin-top: 20px; padding: 15px; background: #fff; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to the Newsletter!</h1>
          <p>Thank you for joining our community of readers</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          
          <p>Thank you for subscribing to my newsletter! I'm excited to share my writing journey, book updates, and exclusive content with you.</p>
          
          <p><strong>What you can expect:</strong></p>
          <ul>
            <li>📚 Early access to new releases and excerpts</li>
            <li>✍️ Behind-the-scenes writing insights</li>
            <li>🎯 Exclusive content just for subscribers</li>
            <li>📖 Reading recommendations and industry news</li>
          </ul>

          <a href="${SITE_URL}" class="button">Visit My Website</a>
          
          <div class="unsubscribe">
            <h3>🤝 Personal Touch</h3>
            <p>I believe in personal connections with my readers. If you ever want to unsubscribe, just reply to any newsletter email or send me a message at <strong>${AUTHOR_EMAIL}</strong> - I'd love to hear your feedback!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Best wishes,<br><strong>${AUTHOR_NAME}</strong></p>
          <p><small>This email was sent to ${email}</small></p>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ${AUTHOR_NAME}'s Newsletter!

Hi ${name || 'there'}!

Thank you for subscribing to my newsletter! I'm excited to share my writing journey, book updates, and exclusive content with you.

What you can expect:
- Early access to new releases and excerpts
- Behind-the-scenes writing insights  
- Exclusive content just for subscribers
- Reading recommendations and industry news

Visit my website: ${SITE_URL}

Personal Touch:
I believe in personal connections with my readers. If you ever want to unsubscribe, just reply to any newsletter email or send me a message at ${AUTHOR_EMAIL} - I'd love to hear your feedback!

Best wishes,
${AUTHOR_NAME}

This email was sent to ${email}
    `
  }),

  // Newsletter template
  newsletter: (data: NewsletterData, subscriberName: string, subscriberEmail: string): EmailTemplate => ({
    subject: data.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
          .container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .content h1, .content h2, .content h3 { color: #2d3748; }
          .content p { margin-bottom: 16px; }
          .content img { max-width: 100%; height: auto; border-radius: 4px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .personal-note { background: #e6fffa; border-left: 4px solid #38b2ac; padding: 20px; margin: 30px 0; border-radius: 4px; }
          .unsubscribe { margin-top: 20px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${AUTHOR_NAME}</h1>
            <p>${data.preheader || 'Newsletter Update'}</p>
          </div>
          
          <div class="content">
            ${data.content.html}
            
            <div class="personal-note">
              <p><strong>📧 Let's Stay Connected</strong></p>
              <p>I love hearing from my readers! Reply to this email anytime - I read every message personally. Whether you have feedback, questions, or just want to chat about books, I'd love to connect.</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thanks for being part of the community!</strong></p>
            <p>${AUTHOR_NAME}</p>
            
            <div class="unsubscribe">
              <p>This email was sent to ${subscriberEmail}</p>
              <p>To unsubscribe, simply reply to this email with "unsubscribe" in the subject line, or email me at ${AUTHOR_EMAIL}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${data.subject}
${'='.repeat(data.subject.length)}

${data.content.text}

---

📧 Let's Stay Connected

I love hearing from my readers! Reply to this email anytime - I read every message personally. Whether you have feedback, questions, or just want to chat about books, I'd love to connect.

Thanks for being part of the community!
${AUTHOR_NAME}

---

This email was sent to ${subscriberEmail}
To unsubscribe, simply reply to this email with "unsubscribe" in the subject line, or email me at ${AUTHOR_EMAIL}
    `
  })
};

// Email sending functions
export async function sendConfirmationEmail(subscriber: Subscriber): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      if (dev) {
        console.log('[email] Dev mode: Would send confirmation email to', subscriber.email);
        return true;
      }
      throw new Error('Email transporter not available');
    }

    const template = emailTemplates.confirmation(subscriber.name || '', subscriber.email);
    
    const mailOptions = {
      from: `"${AUTHOR_NAME}" <${FROM_EMAIL}>`,
      to: subscriber.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
      replyTo: AUTHOR_EMAIL, // Replies go to the author's personal email
      headers: {
        'List-Unsubscribe': `<mailto:${AUTHOR_EMAIL}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`[email] ✅ Confirmation sent to ${subscriber.email.substring(0, 3)}***`);
    return true;

  } catch (error) {
    console.error('[email] ❌ Failed to send confirmation:', error);
    return false;
  }
}

export async function sendNewsletter(
  newsletterData: NewsletterData,
  subscribers: Subscriber[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const transporter = createTransporter();
  if (!transporter) {
    if (dev) {
      console.log(`[email] Dev mode: Would send newsletter "${newsletterData.subject}" to ${subscribers.length} subscribers`);
      return { sent: subscribers.length, failed: 0, errors: [] };
    }
    throw new Error('Email transporter not available');
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log(`[email] 📧 Sending newsletter "${newsletterData.subject}" to ${subscribers.length} subscribers...`);

  // Send emails with rate limiting (to avoid spam filters)
  for (const subscriber of subscribers) {
    try {
      const template = emailTemplates.newsletter(
        newsletterData,
        subscriber.name || '',
        subscriber.email
      );

      const mailOptions = {
        from: `"${AUTHOR_NAME}" <${FROM_EMAIL}>`,
        to: subscriber.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
        replyTo: AUTHOR_EMAIL, // All replies go to author
        headers: {
          'List-Unsubscribe': `<mailto:${AUTHOR_EMAIL}?subject=Unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      };

      await transporter.sendMail(mailOptions);
      sent++;
      
      // Rate limiting: wait 100ms between emails to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      failed++;
      const errorMsg = `Failed to send to ${subscriber.email.substring(0, 3)}***: ${error}`;
      console.error('[email]', errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log(`[email] ✅ Newsletter sent: ${sent} successful, ${failed} failed`);
  return { sent, failed, errors };
}

// Test email function for development
export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[email] Dev mode: Would send test email to', to);
      return true;
    }

    const mailOptions = {
      from: `"${AUTHOR_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: 'Test Email from Your Author Site',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <h2>✅ Email System Working!</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p><strong>Sent from:</strong> ${AUTHOR_NAME}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
      replyTo: AUTHOR_EMAIL
    };

    await transporter.sendMail(mailOptions);
    console.log(`[email] ✅ Test email sent to ${to}`);
    return true;

  } catch (error) {
    console.error('[email] ❌ Test email failed:', error);
    return false;
  }
}

// Utility to validate email configuration
export function validateEmailConfig(): { valid: boolean; missing: string[] } {
  const required = ['SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}