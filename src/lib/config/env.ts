// src/lib/config/env.ts - Improved environment configuration
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
 * Environment configuration with consistent defaults
 */
export const ENV = {
  // MongoDB Configuration
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  MONGODB_DB: getEnvVar('MONGODB_DB', 'Author-site'), // ← Fixed: consistent naming
  
  // Firebase Configuration  
  FIREBASE_BUCKET: getEnvVar('PUBLIC_FIREBASE_STORAGE_BUCKET', 'endless-fire-467204-n2.firebasestorage.app'),
  FIREBASE_API_KEY: getEnvVar('PUBLIC_FIREBASE_API_KEY'),
  FIREBASE_AUTH_DOMAIN: getEnvVar('PUBLIC_FIREBASE_AUTH_DOMAIN'),
  FIREBASE_PROJECT_ID: getEnvVar('PUBLIC_FIREBASE_PROJECT_ID'),
  
  // Application Configuration
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PUBLIC_SITE_URL: getEnvVar('PUBLIC_SITE_URL', 'http://localhost:3000'),
  
  // Email Configuration
  EMAIL_FROM: getEnvVar('EMAIL_FROM'),
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const required = ['MONGODB_URI'] as const;
  const recommended = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID'] as const;
  
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
 * Log environment status (safe for production - no secrets)
 */
export function logEnvironmentStatus(): void {
  console.log('🔧 Environment Configuration:');
  console.log('   Node Environment:', ENV.NODE_ENV);
  console.log('   MongoDB URI provided:', !!ENV.MONGODB_URI);
  console.log('   MongoDB Database:', ENV.MONGODB_DB);
  console.log('   Firebase configured:', !!ENV.FIREBASE_API_KEY);
  console.log('   Site URL:', ENV.PUBLIC_SITE_URL);
  
  const validation = validateEnv();
  if (validation.valid) {
    console.log('✅ All required environment variables are present');
  } else {
    console.error('❌ Environment validation failed');
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