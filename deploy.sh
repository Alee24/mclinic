#!/bin/bash
# Stop script on error
set -e

echo "🚀 Starting Deployment (Preserving Data)..."

# Ensure we are in the right directory (optional, but good practice if running from outside)
# cd /root/mclinic 

echo "🔄 Cleaning code state (git reset --hard)..."
git fetch origin
git reset --hard origin/main
git pull origin main

echo "📦 Installing Global Dependencies..."
npm install

echo "🔧 Setting up API..."
cd apps/api
npm install
npx prisma generate
echo "🗄️  Syncing Database Schema (Data Safe)..."
npx prisma db push

echo "🏗️  Building API..."
npm run build
pm2 restart mclinic-api

echo "🔧 Setting up Web App..."
cd ../web
npm install

echo "🏗️  Building Web App..."
npm run build
pm2 restart mclinic-web

pm2 save
echo "✅ Deployment Successful! Database data was preserved."
pm2 status
