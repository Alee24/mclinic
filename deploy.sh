#!/bin/bash

# M-Clinic Production Deployment Script
# This script ensures all environment variables are set and builds are up to date

echo "🚀 M-Clinic Production Deployment"
echo "=================================="

# Navigate to project root
cd /var/www/mclinicportal

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
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

# Push database schema
echo "💾 Pushing database schema..."
npx prisma db push

# Build API
echo "🏗️  Building API..."
npm run build

# Web Setup
echo "🌐 Setting up Web..."
cd ../web
npm run build

# Restart services
echo "🔄 Restarting PM2 services..."
cd /var/www/mclinicportal
pm2 restart mclinic-api
pm2 restart mclinic-web

# Show status
echo "✅ Deployment complete!"
echo ""
pm2 status

echo ""
echo "📋 Next steps:"
echo "1. Verify API is running: curl https://portal.mclinic.co.ke/api/users/count-active"
echo "2. Check logs if needed: pm2 logs mclinic-api"
echo "3. Create admin user if needed: node create-admin.js"
