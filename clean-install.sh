#!/bin/bash
set -e

echo "=============================================="
echo "    M-CLINIC CLEAN INSTALL & REPAIR SCRIPT"
echo "=============================================="

APP_DIR="/var/www/mclinicportal"

echo "🧹 1. Cleaning up Node Modules (This might take a while)..."
# API
cd "$APP_DIR/apps/api"
rm -rf node_modules package-lock.json dist
echo "   - API cleaned."

# Web
cd "$APP_DIR/apps/web"
rm -rf node_modules package-lock.json .next
echo "   - Web cleaned."

echo "📦 2. Reinstalling Dependencies..."
# API
cd "$APP_DIR/apps/api"
echo "   - Installing API dependencies..."
npm install --legacy-peer-deps

# Web
cd "$APP_DIR/apps/web"
echo "   - Installing Web dependencies..."
npm install --legacy-peer-deps

echo "🚀 3. Launching Full Restart..."
cd "$APP_DIR"
chmod +x full-restart.sh deploy-portal.sh setup-env.sh
./full-restart.sh
