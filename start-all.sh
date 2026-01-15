#!/bin/bash

# ==============================================================================
# MASTER START SCRIPT - M-Clinic & PesaFlow
# ==============================================================================
# This script ensures all services for both M-Clinic and PesaFlow are:
# 1. Correctly configured (Ports)
# 2. Started via PM2
# 3. Verified to be listening effectively
# ==============================================================================

echo "🚀 STAY CALM. STARTING ALL SYSTEMS..."
echo "========================================"

# --- 1. CONFIGURATION CHECK ---

# M-Clinic Config
MC_API_PORT=3434
MC_WEB_PORT=3034

# PesaFlow Config
PF_API_PORT=5454
PF_WEB_PORT=5054

echo "🔧 Verifying Service Ports..."
# No auto-fixing here, just verification or hard restart expectations.
# We assume .env files were fixed by previous commands.

# --- 2. STOP EVERYTHING (To Clean Slack) ---
echo "🛑 Stopping all existing PM2 processes to ensure clean slate..."
pm2 stop all > /dev/null 2>&1

# --- 3. START M-CLINIC ---
echo "🏥 Starting M-Clinic Portal (Port $MC_API_PORT / $MC_WEB_PORT)..."
cd /var/www/mclinicportal || { echo "❌ M-Clinic folder not found!"; exit 1; }

# Ensure ecosystem is used
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    echo "⚠️  M-Clinic ecosystem.config.js missing. Starting manually..."
    # Fallback Manual Start
    cd apps/api && pm2 start dist/main.js --name mclinic-api --env production
    cd ../web && pm2 start npm --name mclinic-web -- start
fi

# --- 4. START PESAFLOW ---
echo "💸 Starting PesaFlow (Port $PF_API_PORT / $PF_WEB_PORT)..."
PF_ROOT="/var/www/mpesaconnect.co.ke"

if [ -d "$PF_ROOT/backend" ]; then
    cd "$PF_ROOT/backend"
    # Ensure Env is strict
    grep -q "PORT=$PF_API_PORT" .env || echo "PORT=$PF_API_PORT" >> .env
    pm2 start dist/main.js --name pesaflow-api --update-env 
else
    echo "❌ PesaFlow Backend not found!"
fi

if [ -d "$PF_ROOT/frontend" ]; then
    cd "$PF_ROOT/frontend"
    # Ensure Env is strict
    grep -q "PORT=$PF_WEB_PORT" .env || echo "PORT=$PF_WEB_PORT" >> .env
    pm2 start npm --name pesaflow-web -- start --update-env
else
    echo "⚠️  PesaFlow Frontend not found at '$PF_ROOT/frontend'. Checking 'web'..."
    if [ -d "$PF_ROOT/web" ]; then
       cd "$PF_ROOT/web"
       pm2 start npm --name pesaflow-web -- start --update-env
    else
       echo "❌ PesaFlow Web not found!"
    fi
fi

# --- 5. VERIFICATION & HEALTH CHECK ---
echo "========================================"
echo "💓 PERFORMING HEALTH CHECKS..."
sleep 5 # Give them a moment to bind

check_port() {
    name=$1
    port=$2
    if netstat -tulpn | grep -q ":$port "; then
        echo "✅ $name is LISTENING on port $port"
    else
        echo "❌ $name FAILED to bind port $port"
        # Diagnosis
        pm2 list | grep $name
    fi
}

check_port "M-Clinic API" $MC_API_PORT
check_port "M-Clinic Web" $MC_WEB_PORT
check_port "PesaFlow API" $PF_API_PORT
check_port "PesaFlow Web" $PF_WEB_PORT

echo "========================================"
echo "📊 PM2 STATUS:"
pm2 list

echo "========================================"
echo "✅ SYSTEM STARTUP SEQUENCE COMPLETE."
echo "   Monitor logs with: pm2 logs"
