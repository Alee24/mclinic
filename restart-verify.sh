#!/bin/bash

# Configuration
APP_DIR="/var/www/mclinicportal"
API_PORT=3434
WEB_PORT=3034
API_NAME="mclinic-api"
WEB_NAME="mclinic-web"

echo "=================================================="
echo "🚀 M-Clinic Portal: Restart & Verify Script"
echo "=================================================="

# 1. Update Database & Client (Crucial Fix)
echo "🔹 [Step 1/3] Updating Database Schema..."
if [ -d "$APP_DIR/apps/api" ]; then
    cd "$APP_DIR/apps/api"
    echo "   > Running Prisma DB Push..."
    npx prisma db push
    echo "   > Generating Prisma Client..."
    npx prisma generate
else
    echo "❌ Error: Cannot find apps/api directory at $APP_DIR/apps/api"
    exit 1
fi

# 2. Restart Services
echo "🔹 [Step 2/3] Restarting Services..."
pm2 restart $API_NAME --update-env || echo "   ⚠️  Could not restart $API_NAME (might not be running)"
pm2 restart $WEB_NAME --update-env || echo "   ⚠️  Could not restart $WEB_NAME (might not be running)"

echo "⏳ Waiting 15 seconds for services to stabilize..."
sleep 15

# 3. Verify Connectivity
echo "🔹 [Step 3/3] Verifying Connectivity..."

# API Verification
API_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:$API_PORT/ || true)
if [[ "$API_STATUS" == "200" ]] || [[ "$API_STATUS" == "404" ]]; then
    echo "✅ API is ONLINE (Response Code: $API_STATUS)"
else
    echo "❌ API seems DOWN (Response Code: $API_STATUS)"
    echo "   ⚠️  Checking recent API logs:"
    pm2 logs $API_NAME --lines 20 --nostream
fi

# Web Verification
WEB_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:$WEB_PORT || true)
if [[ "$WEB_STATUS" == "200" ]]; then
    echo "✅ Web Frontend is ONLINE"
else
    echo "❌ Web Frontend seems DOWN (Response Code: $WEB_STATUS)"
fi

echo "=================================================="
echo "📊 Current PM2 Status:"
pm2 status
echo "=================================================="
