#!/bin/bash
echo "🔍 Troubleshooting Deployment..."

echo "1️⃣  Checking PM2 Status..."
pm2 status

echo "2️⃣  Checking API Port (3434)..."
curl -v http://localhost:3434/health 2>&1 | head -n 10
echo ""

echo "3️⃣  Checking Web Port (3034)..."
curl -v http://localhost:3034 2>&1 | head -n 10
echo ""

echo "4️⃣  Checking API Logs (Last 20 lines)..."
pm2 logs mclinic-api --lines 20 --nostream

echo "5️⃣  Checking Apache Error Log (Last 10 lines)..."
tail -n 10 /var/log/apache2/error.log
