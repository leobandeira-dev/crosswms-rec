#!/bin/bash

# Production deployment script
echo "🚀 Starting production deployment..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-8080}

# Check if build exists, if not build it
if [ ! -d "dist/public" ]; then
    echo "📦 Building application..."
    npm run build
fi

echo "🌐 Starting production server on port $PORT..."
echo "📱 Environment: $NODE_ENV"

# Start the production server
exec tsx server/production-server.ts