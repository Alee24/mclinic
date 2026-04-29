#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/mclinicportal"
BRANCH="MobileApp"

echo "============================================="
echo "🚀 M-Clinic VPS Deployment (Branch: $BRANCH)"
echo "============================================="

# 1. Pull Latest Code
echo "📦 Fetching latest changes from $BRANCH..."
cd $APP_DIR
git fetch origin
git checkout $BRANCH
git reset --hard origin/$BRANCH

# 2. API Deployment
echo "🔹 Updating API..."
cd "$APP_DIR/apps/api"
npm install --legacy-peer-deps
npm run build

# 3. Web Deployment
echo "🔹 Updating Web Frontend..."
cd "$APP_DIR/apps/web"
export NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
npm install --legacy-peer-deps
npm run build

# 4. Restart Services
echo "🔄 Restarting PM2 services..."
pm2 restart all || pm2 start ecosystem.config.js

echo "✅ Deployment Successful!"
echo "============================================="
pm2 status
