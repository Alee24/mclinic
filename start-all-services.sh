#!/bin/bash

################################################################################
# MASTER STARTUP SCRIPT - M-Clinic & PesaFlow
################################################################################
# This script starts all services for both systems with proper port separation
# 
# Port Assignments:
#   M-Clinic API:  3434
#   M-Clinic Web:  3034
#   PesaFlow API:  5454
#   PesaFlow Web:  5054
################################################################################

echo "🚀 STARTING ALL SERVICES..."
echo "========================================"

# Stop all existing processes to ensure clean start
echo "🛑 Stopping existing processes..."
pm2 stop all > /dev/null 2>&1

# --- START M-CLINIC ---
echo ""
echo "🏥 Starting M-Clinic Portal..."

if [ -d "/var/www/mclinicportal" ]; then
    cd /var/www/mclinicportal
    
    # Start using ecosystem config
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
        echo "✅ M-Clinic started via ecosystem.config.js"
    else
        echo "⚠️  ecosystem.config.js not found, starting manually..."
        cd apps/api && pm2 start dist/main.js --name mclinic-api
        cd ../web && pm2 start npm --name mclinic-web -- start
    fi
else
    echo "❌ M-Clinic directory not found at /var/www/mclinicportal"
fi

# --- START PESAFLOW ---
echo ""
echo "💸 Starting PesaFlow..."

# Start PesaFlow API
if [ -d "/var/www/mpesaconnect.co.ke/backend" ]; then
    cd /var/www/mpesaconnect.co.ke/backend
    
    # Ensure PORT is set to 5454
    if ! grep -q "PORT=5454" .env 2>/dev/null; then
        echo "PORT=5454" >> .env
    fi
    
    # Start API
    if [ -f "dist/server.js" ]; then
        pm2 start dist/server.js --name pesaflow-api
        echo "✅ PesaFlow API started on port 5454"
    else
        echo "❌ PesaFlow API dist/server.js not found"
    fi
else
    echo "❌ PesaFlow backend directory not found"
fi

# Start PesaFlow Web
if [ -d "/var/www/mpesaconnect.co.ke/frontend" ]; then
    cd /var/www/mpesaconnect.co.ke/frontend
    
    # Start Web on port 5054
    pm2 start npm --name pesaflow-web -- run dev -- -p 5054
    echo "✅ PesaFlow Web started on port 5054"
else
    echo "❌ PesaFlow frontend directory not found"
fi

# --- VERIFICATION ---
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

echo ""
echo "========================================"
echo "🎯 PORT VERIFICATION:"
echo "========================================"
echo "Expected:"
echo "  M-Clinic API:  3434"
echo "  M-Clinic Web:  3034"
echo "  PesaFlow API:  5454"
echo "  PesaFlow Web:  5054"
echo ""
echo "Actual Listening Ports:"
netstat -tulpn 2>/dev/null | grep node | awk '{print $4}' | sort | sed 's/:::/  /' || echo "  (netstat not available)"

echo ""
echo "========================================"
echo "📊 PM2 PROCESS STATUS:"
echo "========================================"
pm2 list

echo ""
echo "========================================"
echo "✅ SERVICE HEALTH CHECK:"
echo "========================================"

# Test each service
test_service() {
    local name=$1
    local port=$2
    local check_html=$3
    
    if [ "$check_html" = "true" ]; then
        if curl -s http://localhost:$port | grep -q "DOCTYPE\|html\|Next"; then
            echo "✅ $name ($port): WORKING"
            return 0
        fi
    else
        if curl -s http://localhost:$port > /dev/null 2>&1; then
            echo "✅ $name ($port): WORKING"
            return 0
        fi
    fi
    
    echo "❌ $name ($port): NOT RESPONDING"
    return 1
}

test_service "M-Clinic API" 3434 false
test_service "M-Clinic Web" 3034 true
test_service "PesaFlow API" 5454 false
test_service "PesaFlow Web" 5054 true

echo ""
echo "========================================"
echo "🌐 PUBLIC ACCESS:"
echo "========================================"
echo "  🏥 M-Clinic Portal: https://portal.mclinic.co.ke"
echo "  💸 PesaFlow SaaS:   https://mpesaconnect.co.ke"
echo ""
echo "📝 Useful Commands:"
echo "  pm2 list          - View all processes"
echo "  pm2 logs          - View all logs"
echo "  pm2 logs [name]   - View specific service logs"
echo "  pm2 restart all   - Restart all services"
echo "  pm2 stop all      - Stop all services"

# Save PM2 configuration
pm2 save > /dev/null 2>&1

echo ""
echo "✅ STARTUP COMPLETE!"
echo "========================================"
