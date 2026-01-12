#!/bin/bash

# M-Clinic Final Deployment Script
# Run this on your server to complete the deployment

set -e  # Exit on any error

echo "🚀 M-Clinic Final Deployment"
echo "============================"
echo ""

# Navigate to project root
cd /var/www/mclinicportal

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# API Setup
echo "🔧 Setting up API..."
cd apps/api

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate

# Push database schema (creates all tables)
echo "💾 Creating database tables..."
npx prisma db push --accept-data-loss

# Build API
echo "🏗️  Building API..."
npm run build

# Web Setup
echo "🌐 Setting up Web..."
cd ../web

# Build Web
echo "🏗️  Building Web..."
npm run build

# Return to root
cd /var/www/mclinicportal

# Restart services
echo "🔄 Restarting services..."
pm2 restart mclinic-api
pm2 restart mclinic-web

# Wait for services to stabilize
echo "⏳ Waiting for services to start..."
sleep 5

# Show status
echo ""
echo "📊 Service Status:"
pm2 status

# Verify database
echo ""
echo "🔍 Verifying database..."
if [ -f verify-database.sh ]; then
    chmod +x verify-database.sh
    ./verify-database.sh
else
    echo "⚠️  verify-database.sh not found, skipping verification"
fi

# Create admin user if needed
echo ""
echo "👤 Creating admin user..."
if [ -f create-admin.js ]; then
    node create-admin.js || echo "⚠️  Admin user may already exist"
else
    echo "⚠️  create-admin.js not found"
fi

# Final checks
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🧪 Test the system:"
echo "  1. API Health: curl https://portal.mclinic.co.ke/api/users/count-active"
echo "  2. Login: https://portal.mclinic.co.ke/login"
echo "     Email: mettoalex@gmail.com"
echo "     Password: Digital2025"
echo ""
echo "📝 Check logs if needed:"
echo "  pm2 logs mclinic-api --lines 50"
echo "  pm2 logs mclinic-web --lines 50"
echo ""
echo "🎉 Your M-Clinic system is now live!"
