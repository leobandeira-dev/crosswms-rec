#!/usr/bin/env node

/**
 * Static file server for production deployment
 * Serves the built React application without any development dependencies
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production configuration
const PORT = process.env.PORT || 8080;
const NODE_ENV = 'production';

// Set production environment
process.env.NODE_ENV = NODE_ENV;

const app = express();

console.log('🚀 Starting static file server...');
console.log(`📱 Environment: ${NODE_ENV}`);
console.log(`🌐 Port: ${PORT}`);

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT
  });
});

// Serve static files from the build directory
const staticPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(staticPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Handle client-side routing (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Static server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${staticPath}`);
  console.log(`🏥 Health check available at: /health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});