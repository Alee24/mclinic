#!/bin/bash

# M-Clinic Production Startup Script
# This script starts all M-Clinic services

echo "========================================="
echo "M-Clinic Service Startup"
echo "========================================="

# Navigate to project directory
cd /var/www/mclinicportal

# 1. Check if build exists
if [ ! -d "apps/web/.next" ]; then
    echo ">>> Building application (this may take 5-10 minutes)..."
    npm run build
else
    echo ">>> Build found, skipping..."
fi

# 2. Stop any existing PM2 processes
echo ">>> Stopping existing services..."
pm2 delete all 2>/dev/null || true

# 3. Start services with PM2 ecosystem
echo ">>> Starting M-Clinic services..."
pm2 start ecosystem.config.js

# 4. Save PM2 configuration
pm2 save

# 5. Enable PM2 startup on boot
pm2 startup

# 6. Ensure Apache is running
echo ">>> Checking Apache..."
sudo systemctl start apache2
sudo systemctl enable apache2

# 7. Wait a moment for services to stabilize
sleep 3

# 8. Show status
echo ""
echo "========================================="
echo "Service Status:"
echo "========================================="
pm2 status

echo ""
echo ">>> Checking if ports are listening..."
netstat -tlnp | grep -E '3034|3434'

echo ""
echo "========================================="
echo "M-Clinic Services Started!"
echo "========================================="
echo "Frontend (Internal): http://localhost:3034"
echo "API (Internal):      http://localhost:3434"
echo "Public URL:          https://portal.mclinic.co.ke"
echo ""
echo "To view logs:"
echo "  pm2 logs mclinic-api"
echo "  pm2 logs mclinic-web"
echo ""
echo "To stop services:"
echo "  pm2 stop all"
echo "========================================="
