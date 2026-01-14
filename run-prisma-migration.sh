#!/bin/bash

# M-Clinic Prisma Migration Script for Production
# This script will push the Prisma schema to the production database

echo "🔄 Starting Prisma Migration for M-Clinic Production..."

cd /var/www/mclinicportal/apps/api

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found in environment"
    echo "📝 Setting DATABASE_URL from ecosystem config..."
    export DATABASE_URL="mysql://m-cl-app:Mclinic@App2023?@localhost:3306/mclinicportal"
fi

echo "📦 Installing Prisma dependencies..."
npm install prisma @prisma/client --save-dev

echo "🔍 Validating Prisma schema..."
npx prisma validate

echo "🗄️  Pushing schema to database (this will create/update all tables)..."
npx prisma db push --accept-data-loss

echo "✅ Generating Prisma Client..."
npx prisma generate

echo "📊 Checking database status..."
npx prisma db pull --print

echo "✅ Prisma migration complete!"
echo "📝 Restarting API service..."

cd /var/www/mclinicportal
pm2 restart mclinic-api

echo "🎉 All done! Check the logs with: pm2 logs mclinic-api"
