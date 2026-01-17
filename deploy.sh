#!/bin/bash

echo "🚀 M-Clinic Deployment Script"
echo "=============================="
echo ""

# Navigate to project root
cd /root/mclinic || exit

echo "📥 Pulling latest changes from GitHub..."
git stash
git pull origin main

echo ""
echo "🔧 Setting up API..."
cd apps/api

echo "📦 Installing API dependencies..."
npm install

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "💾 Pushing database schema..."
npx prisma db push

echo "🏗️  Building API..."
npm run build

echo "♻️  Restarting API service..."
pm2 restart mclinic-api || pm2 start npm --name "mclinic-api" -- run start:prod

echo ""
echo "🌐 Setting up Web..."
cd ../web

echo "📦 Installing Web dependencies..."
npm install

echo "🏗️  Building Web..."
npm run build

echo "♻️  Restarting Web service..."
pm2 restart mclinic-web || pm2 start npm --name "mclinic-web" -- run start

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "📝 View logs with:"
echo "   pm2 logs mclinic-api"
echo "   pm2 logs mclinic-web"
echo ""
