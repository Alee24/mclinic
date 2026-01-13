#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/mclinicportal"
BRANCH="fix/medic-smtp-updates"

echo "🚀 Starting Server Update..."

# Navigate to App Directory
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    echo "❌ Error: Directory $APP_DIR not found."
    exit 1
fi

echo "📥 Pulling latest changes from branch: $BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# --- 1. Update API ---
echo "🛠️  Updating API..."
cd apps/api
npm install --legacy-peer-deps
npm run build

echo "🔄 Restarting API Service..."
pm2 restart mclinic-api || pm2 start dist/main.js --name mclinic-api --update-env

# --- 2. Update Web ---
echo "🛠️  Updating Web Frontend..."
cd ../../apps/web
npm install --legacy-peer-deps

echo "🏗️  Building Next.js Application..."
# Ensure API URL is set for build
export NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
npm run build

echo "🔄 Restarting Web Service..."
pm2 restart mclinic-web || pm2 start npm --name mclinic-web -- start

# --- 3. Finalize ---
echo "✅ Update Complete!"
pm2 status
