#!/usr/bin/env node
// deployment-check.js - Pre-deployment verification script
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

console.log('🔍 Charles Boswell Author Site - Deployment Verification');
console.log('=' .repeat(60));

let errors = [];
let warnings = [];

// Check 1: Verify essential files exist
console.log('\n📁 Checking essential files...');
const essentialFiles = [
  'package.json',
  'svelte.config.js',
  'vite.config.ts',
  'tsconfig.json',
  'src/app.html'
];

essentialFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    errors.push(`Missing essential file: ${file}`);
    console.log(`❌ ${file}`);
  }
});

// Check 2: Verify package.json configuration
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  
  // Check engines
  if (pkg.engines && pkg.engines.node) {
    console.log(`✅ Node version requirement: ${pkg.engines.node}`);
  } else {
    warnings.push('No Node.js version specified in engines');
    console.log(`⚠️  No Node.js version requirement specified`);
  }
  
  // Check adapter dependency
  if (pkg.devDependencies && pkg.devDependencies['@sveltejs/adapter-node']) {
    console.log(`✅ SvelteKit Node adapter: ${pkg.devDependencies['@sveltejs/adapter-node']}`);
  } else {
    errors.push('Missing @sveltejs/adapter-node dependency');
    console.log(`❌ Missing @sveltejs/adapter-node dependency`);
  }
  
  // Check build script
  if (pkg.scripts && pkg.scripts.build) {
    console.log(`✅ Build script: ${pkg.scripts.build}`);
    
    // Check if build script still uses dotenv for production
    if (pkg.scripts.build.includes('dotenv -e .env.local')) {
      warnings.push('Build script uses dotenv - this may cause issues on Render');
      console.log(`⚠️  Build script includes dotenv - ensure production build doesn't rely on .env.local`);
    }
  } else {
    errors.push('Missing build script');
    console.log(`❌ Missing build script`);
  }
  
} catch (err) {
  errors.push(`Cannot parse package.json: ${err.message}`);
  console.log(`❌ Error parsing package.json: ${err.message}`);
}

// Check 3: Verify svelte.config.js
console.log('\n⚙️ Checking svelte.config.js...');
try {
  const svelteConfig = readFileSync('svelte.config.js', 'utf8');
  
  if (svelteConfig.includes('@sveltejs/adapter-node')) {
    console.log(`✅ Configured with Node.js adapter`);
  } else if (svelteConfig.includes('@sveltejs/adapter-auto')) {
    errors.push('Using adapter-auto instead of adapter-node');
    console.log(`❌ Using adapter-auto - switch to adapter-node for Render`);
  } else {
    warnings.push('Cannot determine which adapter is being used');
    console.log(`⚠️  Cannot determine which adapter is being used`);
  }
  
} catch (err) {
  errors.push(`Cannot read svelte.config.js: ${err.message}`);
  console.log(`❌ Error reading svelte.config.js: ${err.message}`);
}

// Check 4: Environment variables documentation
console.log('\n🔧 Environment variables check...');
const requiredEnvVars = [
  'MONGODB_URI',
  'MONGODB_DB',
  'PUBLIC_FIREBASE_API_KEY',
  'PUBLIC_FIREBASE_PROJECT_ID',
  'PUBLIC_FIREBASE_STORAGE_BUCKET',
  'SMTP_USER',
  'SMTP_PASS',
  'FROM_EMAIL'
];

console.log('Required environment variables for Render:');
requiredEnvVars.forEach(envVar => {
  console.log(`  - ${envVar}`);
});

// Check 5: Build artifacts (if build has been run)
console.log('\n🏗️ Checking build artifacts...');
if (existsSync('build')) {
  const buildFiles = readdirSync('build');
  if (buildFiles.includes('index.js')) {
    console.log(`✅ Build output exists (${buildFiles.length} files)`);
    
    // Check build size
    const buildStats = statSync('build/index.js');
    console.log(`📊 Main build file size: ${Math.round(buildStats.size / 1024)}KB`);
    
    if (buildStats.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('Build file is quite large - consider optimization');
      console.log(`⚠️  Build file is large (${Math.round(buildStats.size / (1024*1024))}MB)`);
    }
  } else {
    warnings.push('Build directory exists but no index.js found');
    console.log(`⚠️  Build directory exists but no index.js found`);
  }
} else {
  console.log(`ℹ️  No build directory found - run 'npm run build' first`);
}

// Check 6: TypeScript configuration
console.log('\n📝 Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
  
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.moduleResolution) {
    console.log(`✅ Module resolution: ${tsConfig.compilerOptions.moduleResolution}`);
  }
  
  if (tsConfig.extends) {
    console.log(`✅ Extends: ${tsConfig.extends}`);
  }
  
} catch (err) {
  warnings.push(`Cannot parse tsconfig.json: ${err.message}`);
  console.log(`⚠️  Error parsing tsconfig.json: ${err.message}`);
}

// Check 7: Render.yaml configuration
console.log('\n🚀 Checking render.yaml...');
if (existsSync('render.yaml')) {
  try {
    const renderYaml = readFileSync('render.yaml', 'utf8');
    
    if (renderYaml.includes('buildCommand:')) {
      console.log(`✅ Build command configured in render.yaml`);
    } else {
      warnings.push('No build command found in render.yaml');
    }
    
    if (renderYaml.includes('npm run build') && !renderYaml.includes('dotenv')) {
      console.log(`✅ Render build command looks correct`);
    } else if (renderYaml.includes('dotenv')) {
      warnings.push('Render build command includes dotenv - this may cause issues');
      console.log(`⚠️  Render build command includes dotenv`);
    }
    
  } catch (err) {
    warnings.push(`Cannot read render.yaml: ${err.message}`);
  }
} else {
  warnings.push('No render.yaml found - using default Render configuration');
  console.log(`ℹ️  No render.yaml found`);
}

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📋 DEPLOYMENT VERIFICATION SUMMARY');
console.log('=' .repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 All checks passed! Your project should deploy successfully.');
} else {
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} error(s) found:`);
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s) found:`);
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n🚨 Please fix the errors above before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ No critical errors found. Warnings should be reviewed but won\'t prevent deployment.');
  }
}

console.log('\n📝 Next steps:');
console.log('1. Fix any errors listed above');
console.log('2. Update your files with the provided fixes');
console.log('3. Test build locally: npm run build:production');
console.log('4. Commit and push to trigger Render deployment');
console.log('5. Monitor Render deployment logs for any additional issues');

console.log('\n🔗 Useful commands:');
console.log('- Test local build: npm run build:production');
console.log('- Test local preview: npm run preview:production');
console.log('- Check types: npm run check');
console.log('- Format code: npm run format');