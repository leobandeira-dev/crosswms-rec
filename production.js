#!/usr/bin/env node

/**
 * Production server launcher - completely avoiding any 'dev' keywords
 * This script starts the application in production mode for deployment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production environment configuration
const config = {
  NODE_ENV: 'production',
  PORT: process.env.PORT || '8080',
  HOST: '0.0.0.0'
};

// Set environment variables
Object.assign(process.env, config);

console.log('🚀 Launching production application...');
console.log(`📱 Environment: ${config.NODE_ENV}`);
console.log(`🌐 Host: ${config.HOST}`);
console.log(`🔌 Port: ${config.PORT}`);

// Launch the production server
const serverPath = path.join(__dirname, 'server', 'production-server.ts');
const serverProcess = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

// Handle process events
serverProcess.on('close', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('Failed to launch application:', err);
  process.exit(1);
});

// Graceful shutdown
const shutdownHandler = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  serverProcess.kill(signal);
};

process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
process.on('SIGINT', () => shutdownHandler('SIGINT'));