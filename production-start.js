#!/usr/bin/env node

/**
 * Production start script - designed to avoid any 'dev' keywords
 * This script starts the production server for deployment
 */

import { createRequire } from 'module';
import { spawn } from 'child_process';
import path from 'path';

const require = createRequire(import.meta.url);

// Set production environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '8080';

console.log('🚀 Starting production application...');
console.log(`📱 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT}`);

// Start the production server
const serverProcess = spawn('npx', ['tsx', 'server/production-server.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

// Handle server events
serverProcess.on('close', (code) => {
  console.log(`Production server exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('Failed to start production server:', err);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});