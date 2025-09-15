// src/lib/config/env.ts - Enhanced with email configuration
import 'dotenv/config';

/**
 * Safely get environment variable with validation
 */
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value !== undefined && value !== '') {
      return value;
    }
  }
  return defaultValue;
}

/**
 * Environment configuration with enhanced email support
 */
export const ENV = {
  // MongoDB Configuration
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  MONGODB_DB: getEnvVar('MONGODB_DB', 'Author-site'),
  
  // Firebase Configuration  
  FIREBASE_BUCKET: getEnvVar('PUBLIC_FIREBASE_STORAGE_BUCKET', 'endless-fire-467204-n2.firebasestorage.app'),
  FIREBASE_API_KEY: getEnvVar('PUBLIC_FIREBASE_API_KEY'),
  FIREBASE_AUTH_DOMAIN: getEnvVar('PUBLIC_FIREBASE_AUTH_DOMAIN'),
  FIREBASE_PROJECT_ID: getEnvVar('PUBLIC_FIREBASE_PROJECT_ID'),
  
  // Application Configuration
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PUBLIC_SITE_URL: getEnvVar('PUBLIC_SITE_URL', 'http://localhost:3000'),
  
  // Email Configuration (Enhanced)
  SMTP_HOST: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
  SMTP_PORT: parseInt(getEnvVar('SMTP_PORT', '587') || '587', 10),
  SMTP_USER: getEnvVar('SMTP_USER'),
  SMTP_PASS: getEnvVar('SMTP_PASS'),
  FROM_EMAIL: getEnvVar('FROM_EMAIL'),
  AUTHOR_EMAIL: getEnvVar('AUTHOR_EMAIL'), // Personal email for replies and unsubscribes
  AUTHOR_NAME: getEnvVar('AUTHOR_NAME', 'Author'),
  
  // Newsletter Configuration
  NEWSLETTER_WEBHOOK_SECRET: getEnvVar('NEWSLETTER_WEBHOOK_SECRET', 'your-secret-key'),
  APPS_SCRIPT_URL: getEnvVar('APPS_SCRIPT_URL'), // Legacy Google Apps Script integration
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const required = ['MONGODB_URI'] as const;
  const recommended = [
    'FIREBASE_API_KEY', 
    'FIREBASE_PROJECT_ID',
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL',
    'AUTHOR_EMAIL',
    'AUTHOR_NAME'
  ] as const;
  
  const missing = required.filter(key => !ENV[key]);
  const warnings = recommended.filter(key => !ENV[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Missing recommended environment variables:', warnings);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Validate email-specific configuration
 */
export function validateEmailConfig(): { valid: boolean; missing: string[]; configured: string[] } {
  const emailRequired = ['SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'] as const;
  const emailOptional = ['AUTHOR_EMAIL', 'AUTHOR_NAME', 'SMTP_HOST'] as const;
  
  const missing = emailRequired.filter(key => !ENV[key]);
  const configured = [...emailRequired, ...emailOptional].filter(key => !!ENV[key]);

  return {
    valid: missing.length === 0,
    missing,
    configured
  };
}

/**
 * Log environment status (safe for production - no secrets)
 */
export function logEnvironmentStatus(): void {
  console.log('🔧 Environment Configuration:');
  console.log('   Node Environment:', ENV.NODE_ENV);
  console.log('   MongoDB URI provided:', !!ENV.MONGODB_URI);
  console.log('   MongoDB Database:', ENV.MONGODB_DB);
  console.log('   Firebase configured:', !!ENV.FIREBASE_API_KEY);
  console.log('   Site URL:', ENV.PUBLIC_SITE_URL);
  
  // Email configuration status
  console.log('📧 Email Configuration:');
  console.log('   SMTP configured:', !!(ENV.SMTP_USER && ENV.SMTP_PASS));
  console.log('   From email set:', !!ENV.FROM_EMAIL);
  console.log('   Author email set:', !!ENV.AUTHOR_EMAIL);
  console.log('   Author name:', ENV.AUTHOR_NAME);
  
  const validation = validateEnv();
  const emailValidation = validateEmailConfig();
  
  if (validation.valid) {
    console.log('✅ All required environment variables are present');
  } else {
    console.error('❌ Environment validation failed');
  }
  
  if (emailValidation.valid) {
    console.log('✅ Email system is properly configured');
  } else {
    console.warn('⚠️ Email system needs configuration:', emailValidation.missing);
  }
}

/**
 * Get database connection details for logging (safe - no credentials)
 */
export function getConnectionInfo(): { hasUri: boolean; dbName: string; masked: string } {
  const uri = ENV.MONGODB_URI;
  return {
    hasUri: !!uri,
    dbName: ENV.MONGODB_DB || 'NOT_SET',
    masked: uri ? uri.replace(/\/\/[^@]+@/, '//***:***@') : 'NOT_PROVIDED'
  };
}

/**
 * Get email configuration summary (safe - no passwords)
 */
export function getEmailConfigSummary(): {
  configured: boolean;
  host: string;
  port: number;
  hasCredentials: boolean;
  fromEmail: string;
  authorEmail: string;
  authorName: string;
} {
  return {
    configured: !!(ENV.SMTP_USER && ENV.SMTP_PASS && ENV.FROM_EMAIL),
    host: ENV.SMTP_HOST || 'NOT_SET',
    port: ENV.SMTP_PORT,
    hasCredentials: !!(ENV.SMTP_USER && ENV.SMTP_PASS),
    fromEmail: ENV.FROM_EMAIL || 'NOT_SET',
    authorEmail: ENV.AUTHOR_EMAIL || 'NOT_SET',
    authorName: ENV.AUTHOR_NAME || 'NOT_SET'
  };
}