#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting development server...');

// Try to run tsx first, fallback to node if tsx is not available
const tsxPath = path.join(__dirname, 'node_modules', '.bin', 'tsx');
const serverPath = path.join(__dirname, 'server', 'index.ts');

const child = spawn('node', ['--loader', 'tsx', serverPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

child.on('error', (err) => {
  console.error('Failed to start server with tsx, trying alternative...');
  
  // Fallback to server.js
  const fallbackChild = spawn('node', [path.join(__dirname, 'server.js')], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  fallbackChild.on('error', (fallbackErr) => {
    console.error('Failed to start server:', fallbackErr);
    process.exit(1);
  });
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});


