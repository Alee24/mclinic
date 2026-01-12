#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/mclinicportal"
API_PORT=3434
WEB_PORT=3034
API_NAME="mclinic-api"
WEB_NAME="mclinic-web"

# Adjust these if your folder structure is different
API_PATH="apps/api"
WEB_PATH="apps/web"

echo "🚀 Deploying M-Clinic Portal..."

# --- 1. API Deployment ---
echo "🔹 Setting up API..."
cd "$APP_DIR/$API_PATH"

# Install & Build
npm install --legacy-peer-deps
npm run build

# Start API on Port 3434
echo "🔄 Starting API ($API_NAME) on port $API_PORT..."
pm2 delete $API_NAME 2>/dev/null || true
PORT=$API_PORT pm2 start dist/main.js --name $API_NAME --update-env

# --- 2. Web Deployment ---
echo "🔹 Setting up Web Frontend..."
cd "$APP_DIR/$WEB_PATH"

# Set API URL for the build
# We assume Apache proxies /api to localhost:3434
export NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api" 
export PORT=$WEB_PORT

# Install & Build
npm install --legacy-peer-deps
echo "🏗️  Building Next.js app..."
npm run build

# Start Web on Port 3034
echo "🔄 Starting Web ($WEB_NAME) on port $WEB_PORT..."
pm2 delete $WEB_NAME 2>/dev/null || true
PORT=$WEB_PORT pm2 start npm --name $WEB_NAME -- start

# Save PM2 list
pm2 save

echo "✅ Deployment Complete!"
echo "   - API running on Port $API_PORT ($API_NAME)"
echo "   - Web running on Port $WEB_PORT ($WEB_NAME)"
pm2 status
