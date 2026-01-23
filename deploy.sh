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

echo "📦 Installing Global Dependencies..."
npm install

echo "🔧 Setting up API..."
cd apps/api
npm install
npx prisma generate

echo "⚠️  SKIPPING Database Schema Update to protect data."
echo "   If you made changes to the database schema (schema.prisma),"
echo "   please run 'npx prisma db push' manually inside apps/api."
# npx prisma db push 

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
