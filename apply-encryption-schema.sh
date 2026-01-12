#!/bin/bash
echo "🛡️ Applying Schema Updates for Encryption..."
cd /var/www/mclinicportal/apps/api

# Push the schema changes (this alters the columns to be wider)
# We use db push to sync schema.prisma with the DB
npx prisma db push --accept-data-loss

# Generate Prisma Client (just in case)
npx prisma generate

echo "✅ Schema updated."
echo "🔄 Restarting API to pick up new lengths..."
pm2 restart mclinic-api
