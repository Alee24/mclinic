#!/bin/bash

# M-Clinic Fresh Installation Script
# This script performs a complete fresh installation of the M-Clinic application

echo "🚀 Starting M-Clinic Fresh Installation..."
echo "================================================"

# Step 1: Stop and remove existing PM2 processes
echo "📛 Step 1: Stopping existing PM2 processes..."
pm2 stop all
pm2 delete all
pm2 save --force

# Step 2: Navigate to project directory
echo "📂 Step 2: Navigating to project directory..."
cd /var/www/mclinicportal

# Step 3: Pull latest code
echo "📥 Step 3: Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
git pull origin main

# Step 4: Install dependencies
echo "📦 Step 4: Installing dependencies..."
npm install

# Step 5: Build API
echo "🔨 Step 5: Building API..."
cd apps/api
npm install
npm run build

# Step 6: Build Web
echo "🌐 Step 6: Building Web..."
cd ../web
npm install
npm run build

# Step 7: Copy production environment file
echo "⚙️  Step 7: Setting up environment..."
cd /var/www/mclinicportal/apps/api
cp .env.production .env

# Step 8: Verify database connection
echo "🗄️  Step 8: Verifying database..."
mysql -u m-cl-app -p'Mclinic@App2023?' mclinicportal -e "SELECT 'Database connection successful!' AS Status;"

# Step 9: Start PM2 services
echo "🚀 Step 9: Starting PM2 services..."
cd /var/www/mclinicportal
pm2 start ecosystem.config.js
pm2 save

# Step 10: Wait and check status
echo "⏳ Step 10: Waiting for services to start..."
sleep 10

echo ""
echo "================================================"
echo "✅ Installation Complete!"
echo "================================================"
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📝 API Logs (last 20 lines):"
pm2 logs mclinic-api --lines 20 --nostream

echo ""
echo "🎉 M-Clinic is now running!"
echo "🌐 Web: https://portal.mclinic.co.ke"
echo "🔌 API: https://portal.mclinic.co.ke/api"
echo ""
echo "To view logs: pm2 logs"
echo "To restart: pm2 restart all"
echo "================================================"
