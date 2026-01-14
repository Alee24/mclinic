#!/bin/bash

echo "=========================================="
echo "    M-CLINIC DASHBOARD DEBUGGER"
echo "=========================================="

API_PORT=5454
PUBLIC_URL="https://portal.mclinic.co.ke/api/users/count-active"
LOCAL_URL="http://localhost:$API_PORT/users/count-active"

echo ""
echo "🔍 1. Checking API Local Access ($API_PORT)..."
if curl -s --max-time 5 $LOCAL_URL > /dev/null; then
    echo "   ✅ Local API is responding."
    curl -s $LOCAL_URL
    echo ""
else
    echo "   ❌ Local API is NOT responding. Service might be down."
fi

echo ""
echo "🔍 2. Checking Public API Access (via Apache)..."
if curl -s -k --max-time 5 $PUBLIC_URL > /dev/null; then
    echo "   ✅ Public API is accessible."
else
    echo "   ❌ Public API Failure. Apache proxy might be misconfigured."
    echo "      Trying to reach: $PUBLIC_URL"
    curl -v -k $PUBLIC_URL 2>&1 | head -n 10
fi

echo ""
echo "🔍 3. Checking Database Connection Logs..."
# Check for common DB errors in the logs
if grep -q "P1001" /var/www/mclinicportal/logs/api-out.log 2>/dev/null; then
    echo "   ⚠️  Found Connection Errors (P1001) in logs."
elif grep -q "Access denied" /var/www/mclinicportal/logs/api-out.log 2>/dev/null; then
    echo "   ⚠️  Found 'Access denied' errors in logs."
else
    echo "   ℹ️  No obvious DB connection errors found in recent logs."
fi

echo ""
echo "📋 4. Recent API Logs (Last 20 lines):"
echo "----------------------------------------"
if [ -f "/var/www/mclinicportal/logs/api-out.log" ]; then
    tail -n 20 /var/www/mclinicportal/logs/api-out.log
else
    pm2 logs mclinic-api --lines 20 --nostream
fi
echo "----------------------------------------"

echo ""
echo "🛠️  RECOMMENDED FIXES:"
echo "1. If Public API failed: check Apache config."
echo "2. If Local API failed: check 'pm2 status' and 'pm2 logs mclinic-api'."
echo "3. If DB errors found: check DATABASE_URL in ecosystem.config.js."

