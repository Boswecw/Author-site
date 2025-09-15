// src/lib/server/mailer.ts - Enhanced mailer with better configuration
import { dev } from '$app/environment';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Get environment variables with proper fallbacks
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
const AUTHOR_EMAIL = process.env.AUTHOR_EMAIL || process.env.SMTP_USER || FROM_EMAIL;
const AUTHOR_NAME = process.env.AUTHOR_NAME || 'Author';

// Singleton transporter
let transporter: Transporter | null = null;

export function createTransporter(): Transporter | null {
  // Return existing transporter if available
  if (transporter) {
    return transporter;
  }

  // Check if credentials are available
  if (!SMTP_USER || !SMTP_PASS) {
    if (dev) {
      console.warn('[mailer] 📧 SMTP credentials missing in development mode');
      console.warn('[mailer] 📧 Email sending will be simulated');
      return null;
    }
    throw new Error('SMTP credentials not configured. Set SMTP_USER and SMTP_PASS environment variables.');
  }

  try {
    // Create transporter with enhanced configuration
    transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      // Additional security and reliability options
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      },
      // Connection pooling for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Rate limiting to be respectful to SMTP servers
      rateDelta: 1000, // 1 second
      rateLimit: 5, // 5 emails per second max
      // Timeout settings
      connectionTimeout: 60000, // 60 seconds
      socketTimeout: 60000, // 60 seconds
    });

    console.log(`[mailer] ✅ SMTP transporter created: ${SMTP_HOST}:${SMTP_PORT}`);
    return transporter;

  } catch (error) {
    console.error('[mailer] ❌ Failed to create SMTP transporter:', error);
    transporter = null;
    throw error;
  }
}

// Verify SMTP connection
export async function verifyConnection(): Promise<boolean> {
  try {
    const transport = createTransporter();
    if (!transport) {
      return dev; // Return true in dev mode (simulated)
    }

    await transport.verify();
    console.log('[mailer] ✅ SMTP connection verified');
    return true;

  } catch (error) {
    console.error('[mailer] ❌ SMTP connection failed:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<{
  success: boolean;
  error?: string;
  config: {
    host: string;
    port: number;
    user: string;
    fromEmail: string;
    authorEmail: string;
  };
}> {
  const config = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER || 'NOT_SET',
    fromEmail: FROM_EMAIL,
    authorEmail: AUTHOR_EMAIL
  };

  try {
    const isValid = await verifyConnection();
    
    return {
      success: isValid,
      config,
      ...(isValid ? {} : { error: 'SMTP connection failed' })
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config
    };
  }
}

// Get email configuration summary
export function getEmailConfig(): {
  configured: boolean;
  host: string;
  port: number;
  hasCredentials: boolean;
  fromEmail: string;
  authorEmail: string;
  authorName: string;
  isDevelopment: boolean;
} {
  return {
    configured: !!(SMTP_USER && SMTP_PASS),
    host: SMTP_HOST,
    port: SMTP_PORT,
    hasCredentials: !!(SMTP_USER && SMTP_PASS),
    fromEmail: FROM_EMAIL,
    authorEmail: AUTHOR_EMAIL,
    authorName: AUTHOR_NAME,
    isDevelopment: dev
  };
}

// Close transporter (for cleanup)
export function closeTransporter(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log('[mailer] 📧 SMTP transporter closed');
  }
}

// Export constants for use in other modules
export { FROM_EMAIL, AUTHOR_EMAIL, AUTHOR_NAME };

// Development simulation function
export function simulateEmailInDev(to: string, subject: string, content?: string): void {
  if (dev) {
    console.log('📧 [DEV] Simulated email send:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${FROM_EMAIL}`);
    console.log(`   Reply-To: ${AUTHOR_EMAIL}`);
    if (content) {
      console.log(`   Content Preview: ${content.substring(0, 100)}...`);
    }
  }
}