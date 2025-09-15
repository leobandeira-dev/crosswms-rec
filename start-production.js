#!/usr/bin/env node

/**
 * Production start script - completely avoids any development references
 * Sets NODE_ENV to production and starts the application properly
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// 🎯 Fix: Set NODE_ENV to production for the deployment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '8080';

console.log('🚀 Initializing production application...');
console.log(`📱 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔌 PORT: ${process.env.PORT}`);

// Check if build exists
const buildPath = path.join(process.cwd(), 'dist', 'public');
if (!existsSync(buildPath)) {
  console.log('📦 Build not found, creating production build...');
  
  // Run build first
  const buildProcess = spawn('npx', ['vite', 'build'], {
    stdio: 'inherit',
    env: process.env
  });
  
  buildProcess.on('close', (buildCode) => {
    if (buildCode === 0) {
      console.log('✅ Build completed successfully');
      startServer();
    } else {
      console.error('❌ Build failed');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Build found, starting server...');
  startServer();
}

function startServer() {
  // Start the production server
  const serverProcess = spawn('npx', ['tsx', 'serve-static.js'], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
  });

  serverProcess.on('close', (code) => {
    console.log(`Application exited with code ${code}`);
    process.exit(code);
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down...');
    serverProcess.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    serverProcess.kill('SIGINT');
  });
}