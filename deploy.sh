#!/bin/bash
# Stop script on error
set -e

# Define target directory
APP_DIR="/var/www/mclinicportal"

echo "🚀 Starting Deployment to $APP_DIR"
cd $APP_DIR || { echo "❌ Directory $APP_DIR not found!"; exit 1; }

echo "🔄 Cleaning code state..."
git fetch origin
git reset --hard origin/main
git pull origin main

echo "🔒 Making scripts executable..."
find . -name "*.sh" -exec chmod +x {} \;

echo "📦 Installing Global Dependencies..."
npm install

echo "🔧 Setting up API..."
cd apps/api
npm install
npx prisma generate

echo "🗄️  Running Database Migrations..."
npm run migration:run:prod || echo "⚠️  Migration failed or nothing to run. Continuing..."

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
echo "✅ Deployment Successful!"
pm2 status
