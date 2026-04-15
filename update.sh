#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/mclinicportal"
BRANCH="main"

echo "🚀 Starting Server Update (Force Mode)..."

# Navigate to App Directory
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    echo "❌ Error: Directory $APP_DIR not found."
    exit 1
fi

echo "📥 Syncing latest changes from branch: $BRANCH..."
git fetch origin
git reset --hard "origin/$BRANCH"

# --- 1. Update API ---
echo "🛠️  Updating API..."
cd apps/api
npm install --legacy-peer-deps
npm run build

echo "🔄 Restarting API Service..."
pm2 restart mclinic-api --update-env || PORT=7899 pm2 start dist/main.js --name mclinic-api

# --- 2. Update Web ---
echo "🛠️  Updating Web Frontend..."
cd ../../apps/web
npm install --legacy-peer-deps

echo "🏗️  Building Next.js Application..."
export NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
npm run build

echo "🔄 Restarting Web Service..."
pm2 restart mclinic-web --update-env || PORT=5054 pm2 start npm --name mclinic-web -- start

# --- 3. Finalize ---
echo "✅ Update Complete!"
pm2 status
