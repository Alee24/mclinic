#!/bin/bash
set -e

echo "=============================================="
echo "  M-CLINIC SERVICE DIAGNOSTICS & FIX"
echo "=============================================="

echo ""
echo "📊 Step 1: Checking Service Status..."
echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "🔍 Step 2: Checking Ports..."
echo ""
echo "Port 5454 (API):"
sudo lsof -i :5454 || echo "   ❌ Nothing running on port 5454"
echo ""
echo "Port 5054 (Web):"
sudo lsof -i :5054 || echo "   ❌ Nothing running on port 5054"

echo ""
echo "📝 Step 3: Checking Environment Files..."
echo ""
echo "API .env:"
if [ -f "/var/www/mclinicportal/apps/api/.env" ]; then
    cat /var/www/mclinicportal/apps/api/.env
else
    echo "   ❌ API .env not found!"
fi

echo ""
echo "🔧 Step 4: Testing Database Connection..."
cd /var/www/mclinicportal/apps/api
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'm-cl-app',
      password: 'Mclinic@App2023?',
      database: 'mclinicportal'
    });
    console.log('   ✅ Database connection successful');
    await conn.end();
  } catch (err) {
    console.log('   ❌ Database connection failed:', err.message);
  }
})();
"

echo ""
echo "📋 Step 5: Checking PM2 Logs..."
echo ""
echo "API Errors (last 20 lines):"
pm2 logs mclinic-api --lines 20 --nostream --err || echo "   No API logs found"

echo ""
echo "Web Errors (last 20 lines):"
pm2 logs mclinic-web --lines 20 --nostream --err || echo "   No Web logs found"

echo ""
echo "🔄 Step 6: Attempting Service Restart..."
echo ""

# Kill any processes on the ports
sudo lsof -ti:5454 | xargs kill -9 2>/dev/null || true
sudo lsof -ti:5054 | xargs kill -9 2>/dev/null || true

# Delete PM2 processes
pm2 delete all 2>/dev/null || true

# Ensure Node 20 is active
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Start API
echo "   Starting API on port 5454..."
cd /var/www/mclinicportal/apps/api
DATABASE_URL="mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal" \
PORT=5454 \
NODE_ENV=production \
/root/.nvm/versions/node/v20.20.0/bin/node dist/main.js > /tmp/api.log 2>&1 &
API_PID=$!
echo "   API started with PID: $API_PID"

sleep 3

# Test API
echo ""
echo "   Testing API endpoint..."
curl -s http://localhost:5454/users/count-active || echo "   ❌ API not responding"

# Start Web
echo ""
echo "   Starting Web on port 5054..."
cd /var/www/mclinicportal/apps/web
PORT=5054 /root/.nvm/versions/node/v20.20.0/bin/npm start > /tmp/web.log 2>&1 &
WEB_PID=$!
echo "   Web started with PID: $WEB_PID"

sleep 3

# Test Web
echo ""
echo "   Testing Web endpoint..."
curl -s http://localhost:5054 | head -20

echo ""
echo "=============================================="
echo "✅ DIAGNOSTICS COMPLETE"
echo "=============================================="
echo ""
echo "📊 Current Status:"
echo "   API PID: $API_PID (port 5454)"
echo "   Web PID: $WEB_PID (port 5054)"
echo ""
echo "📝 View Logs:"
echo "   API: tail -f /tmp/api.log"
echo "   Web: tail -f /tmp/web.log"
echo ""
echo "🌐 Test Your Site:"
echo "   https://portal.mclinic.co.ke"
echo "   https://portal.mclinic.co.ke/api/users/count-active"
echo "=============================================="
