#!/bin/bash
set -e
echo "🛠️ Fixing Database Schema Mismatch..."

cd /var/www/mclinicportal/apps/api

# 1. Generate Prisma Client (Ensure it matches schema.prisma)
echo "🔄 Generating Prisma Client..."
npx prisma generate

# 2. Push Schema to Database
echo "🚀 Pushing Schema to DB..."
# This will create missing columns like 'role'
npx prisma db push --accept-data-loss

echo "✅ Database Fixed!"

# 3. Restart API
echo "🔄 Restarting API..."
pm2 restart mclinic-api
pm2 logs mclinic-api --lines 20 --nostream
