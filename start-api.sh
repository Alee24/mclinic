#!/bin/bash
set -e

echo "🚀 Starting M-Clinic API Service..."
cd /var/www/mclinicportal/apps/api

# Install dependencies just in case
echo "📦 Installing API dependencies..."
npm install

# Build the API
echo "🏗️  Building API..."
npm run build

# Start with PM2
echo "🔄 Starting PM2 process..."
# Check if it already exists, delete if so to ensure fresh start
pm2 delete mclinic-api 2>/dev/null || true
PORT=5454 pm2 start dist/main.js --name mclinic-api --update-env

# Save PM2 list
pm2 save

echo "✅ API Started successfully!"
pm2 status
