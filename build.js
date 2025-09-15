#!/usr/bin/env node

/**
 * Production build script
 * Creates optimized production bundle
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('📦 Starting production build process...');

// Check if we have the necessary files
if (!existsSync('vite.config.ts')) {
  console.error('❌ vite.config.ts not found');
  process.exit(1);
}

// Run the build process
const buildProcess = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Production build completed successfully');
    console.log('📁 Built files are in dist/public/');
  } else {
    console.error(`❌ Build failed with exit code ${code}`);
  }
  process.exit(code);
});

buildProcess.on('error', (err) => {
  console.error('❌ Build process failed:', err);
  process.exit(1);
});