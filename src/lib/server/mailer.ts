// src/lib/server/mailer.ts - FIXED unterminated string and missing variables
import { dev } from '$app/environment';
import nodemailer from 'nodemailer';

// ✅ FIXED: Properly get environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com'; // ✅ FIXED: Terminated string

export function createTransporter() {
  // ✅ FIXED: Use properly defined variables
  if (!SMTP_USER || !SMTP_PASS) {
    if (dev) {
      console.warn('[mailer] SMTP credentials missing in development');
      return null;
    }
    throw new Error('SMTP credentials not configured');
  }

  // ✅ FIXED: Use defined variables instead of undefined ones
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { 
      user: SMTP_USER, 
      pass: SMTP_PASS 
    }
  });
}

export { FROM_EMAIL };