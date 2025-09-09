// start.js - Wrapper to catch startup errors
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting Charles Boswell Author Site...');
console.log('📁 Working directory:', process.cwd());
console.log('🔧 Node version:', process.version);
console.log('📝 Environment variables loaded:', Object.keys(process.env).filter(k => k.startsWith('MONGODB') || k.startsWith('SMTP') || k.startsWith('PUBLIC_')));

// Check if build output exists
const buildPath = join(process.cwd(), 'build', 'index.js');
try {
  const stats = readFileSync(buildPath);
  console.log('✅ Build file found:', buildPath);
} catch (err) {
  console.error('❌ Build file not found:', buildPath);
  console.error('📂 Available files in build directory:');
  try {
    const { readdirSync } = await import('fs');
    console.log(readdirSync(join(process.cwd(), 'build')));
  } catch {
    console.error('Could not read build directory');
  }
  process.exit(1);
}

// Import and start the app
try {
  console.log('🎬 Loading SvelteKit app...');
  await import('./build/index.js');
} catch (error) {
  console.error('💥 Failed to start application:');
  console.error(error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}