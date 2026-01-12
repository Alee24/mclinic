#!/bin/bash

# M-Clinic Server Fix Script
# Run this on your server to fix the deployment issues

echo ">>> Fixing M-Clinic Deployment Issues..."

# 1. Update PM2
echo ">>> Updating PM2..."
pm2 update

# 2. Fix MySQL Root Password (if needed)
echo ">>> Checking MySQL..."
# Create database with your credentials
mysql -u m-cl-app -p'Mclinic@App2023?' -e "CREATE DATABASE IF NOT EXISTS mclinic;" 2>/dev/null || echo "Database may already exist"
mysql -u m-cl-app -p'Mclinic@App2023?' -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# 3. Stop errored services
echo ">>> Stopping errored services..."
pm2 delete mclinic-web 2>/dev/null || true
pm2 delete temp-api 2>/dev/null || true

# 4. Navigate to project
cd /var/www/mclinicportal

# 5. Install dependencies again
echo ">>> Installing dependencies..."
npm install

# 6. Build the application
echo ">>> Building application..."
npm run build

# 7. Start services
echo ">>> Starting services..."
pm2 delete mclinic-api 2>/dev/null || true

cd apps/api
pm2 start npm --name "mclinic-api" -- start
cd ../..

cd apps/web  
pm2 start npm --name "mclinic-web" -- start
cd ../..

pm2 save
pm2 startup

echo ">>> Checking service status..."
pm2 status

echo ""
echo "========================================="
echo "Fix Complete!"
echo "========================================="
echo "API should be running on: http://localhost:3434"
echo "Frontend should be running on: http://localhost:3000"
echo ""
echo "Next steps:"
echo "1. Configure Apache (copy apache.conf)"
echo "2. Get SSL certificate"
echo "3. Access at: https://portal.mclinic.co.ke"
echo "========================================="
