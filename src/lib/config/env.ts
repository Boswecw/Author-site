import 'dotenv/config';
// Helper to get environment variable safely
function getEnvVar(key: string, defaultValue?: string): string | undefined {
    // Try different ways to access environment variables
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }
  
  export const ENV = {
    MONGODB_URI: getEnvVar('MONGODB_URI'),
    MONGODB_DB: getEnvVar('MONGODB_DB', 'author_site'),
    FIREBASE_BUCKET: getEnvVar('FIREBASE_BUCKET', 'endless-fire-467204-n2.firebasestorage.app'),
    PUBLIC_SITE_URL: getEnvVar('PUBLIC_SITE_URL', 'http://localhost:3000'),
  } as const;

  // Validate required environment variables
  export function validateEnv(): void {
    const required = ['MONGODB_URI'] as const;
    const missing = required.filter(key => !ENV[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
