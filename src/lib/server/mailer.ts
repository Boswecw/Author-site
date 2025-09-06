// src/lib/server/mailer.ts
import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import { dev } from '$app/environment';

export function getTransport() {
  const host = env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(env.SMTP_PORT || 587);
  const user = env.SMTP_USER;            // <- no placeholders
  const pass = env.SMTP_PASS;

  if (!user || !pass) {
    if (dev) {
      console.warn('[mailer] missing SMTP creds; using JSON transport (dev only)');
      return nodemailer.createTransport({ jsonTransport: true });
    }
    throw new Error('SMTP credentials missing in production');
  }

  return nodemailer.createTransport({
    host, port, secure: false,
    auth: { user, pass }
  });
}
