#!/bin/bash

# Production build script - creates optimized production bundle
echo "📦 Starting production build process..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Create production build
echo "🔨 Building application for production..."
npm run build

# Verify build was created
if [ -d "dist/public" ]; then
    echo "✅ Production build completed successfully"
    echo "📁 Build output directory: dist/public"
    ls -la dist/public
else
    echo "❌ Build failed - dist/public directory not found"
    exit 1
fi

echo "🎯 Production build ready for deployment"