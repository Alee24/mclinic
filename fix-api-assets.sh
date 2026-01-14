#!/bin/bash
set -e

echo "=============================================="
echo "  M-CLINIC FIX & REDEPLOY"
echo "  Fixing Missing Email Templates"
echo "=============================================="

APP_DIR="/var/www/mclinicportal"

echo ""
echo "📥 1. Pulling latest code..."
cd "$APP_DIR"
git pull origin main

echo ""
echo "🏗️  2. Rebuilding API to copy assets correctly..."
cd "$APP_DIR/apps/api"
# Clean dist folder first to be sure
rm -rf dist
npm run build

echo ""
echo "🔄 3. Restarting Services..."
cd "$APP_DIR"
pm2 restart mclinic-api
pm2 save

echo ""
echo "✅ Fix Deployed!"
echo "   Please wait 10 seconds and check logs if errors persist."
