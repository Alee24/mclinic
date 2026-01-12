#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/mpesaconnect.co.ke"
API_PORT=5454
WEB_PORT=5054
API_NAME="mpesaconnect-api"
WEB_NAME="mpesaconnect-web"

# Adjust these if your folder structure is different (e.g., existing repo uses apps/api)
API_PATH="apps/api"
WEB_PATH="apps/web"

echo "🚀 Deploying M-Pesa Connect (separate instance)..."

# --- 1. API Deployment ---
echo "🔹 Setting up API..."
cd "$APP_DIR/$API_PATH"

# Install & Build
npm install --legacy-peer-deps
npm run build

# Start API on Port 5454
echo "🔄 Starting API ($API_NAME) on port $API_PORT..."
pm2 delete $API_NAME 2>/dev/null || true
PORT=$API_PORT pm2 start dist/main.js --name $API_NAME --update-env

# --- 2. Web Deployment ---
echo "🔹 Setting up Web Frontend..."
cd "$APP_DIR/$WEB_PATH"

# Set API URL for the build (Assuming Apache/Nginx will proxy /api to 5454)
# If no proxy, change this to http://YOUR_SERVER_IP:5454
export NEXT_PUBLIC_API_URL="/api" 
export PORT=$WEB_PORT

# Install & Build
npm install --legacy-peer-deps
echo "🏗️  Building Next.js app..."
npm run build

# Start Web on Port 5054
echo "🔄 Starting Web ($WEB_NAME) on port $WEB_PORT..."
pm2 delete $WEB_NAME 2>/dev/null || true
PORT=$WEB_PORT pm2 start npm --name $WEB_NAME -- start

# Save PM2 list
pm2 save

echo "✅ Deployment Complete!"
echo "   - API running on Port $API_PORT ($API_NAME)"
echo "   - Web running on Port $WEB_PORT ($WEB_NAME)"
pm2 status
