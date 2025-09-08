#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting development environment with Vite...');

// Start Vite dev server
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Wait a bit for Vite to start
setTimeout(() => {
  // Start Express server
  const expressProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', PORT: '3000' }
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    viteProcess.kill();
    expressProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nShutting down servers...');
    viteProcess.kill();
    expressProcess.kill();
    process.exit(0);
  });

}, 3000);


