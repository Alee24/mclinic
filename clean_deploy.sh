#!/bin/bash
echo "⚠️  WARNING: This will DELETE ALL DATA and fetch the latest code."
# Wait 5 seconds to give user a chance to cancel
sleep 5

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing global dependencies..."
npm install

echo "📦 Installing API dependencies..."
cd apps/api
npm install

echo "🧹 Cleaning Database (Force Reset)..."
# This drops tables and recreates them
npx prisma db push --force-reset
npx prisma generate

echo "🌱 Restoring Admin Account..."
node scripts/restore_admin.js

echo "🏗️  Building API..."
npm run build
pm2 restart mclinic-api

echo "📦 Installing Web dependencies..."
cd ../web
npm install

echo "🏗️  Building Web App..."
npm run build
pm2 restart mclinic-web

echo "✅ Clean Deployment Complete! Database has been reset."
pm2 status
