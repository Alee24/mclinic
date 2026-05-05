#!/bin/bash
# Stop script on error
set -e

# Load environment variables if .env exists
if [ -f apps/api/.env ]; then
  export $(grep -v '^#' apps/api/.env | xargs)
fi

DB_USER=${DB_USER:-"m-cl-app"}
DB_PASS=${DB_PASSWORD:-"Mclinic@App2023?"}
DB_NAME=${DB_NAME:-"mclinicportal"}
DB_HOST=${DB_HOST:-"127.0.0.1"}

echo "🚀 Starting Full System Reinstall & Reset..."

echo "📥 Updating code from repository..."
git fetch origin
git reset --hard origin/MobileApp

echo "🧹 Clearing old builds and dependencies..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Resetting Database ($DB_NAME)..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;"

echo "🔧 Building API..."
cd apps/api
npm install
npm run build

echo "🌱 Seeding Essential Data (Admin & Settings)..."
# We use a standalone script to avoid needing the API to be running yet
npx ts-node -r tsconfig-paths/register src/database/seed-essential.ts || {
  echo "⚠️  Standalone seed failed, trying via API endpoint..."
  pm2 restart mclinic-api || pm2 start dist/main.js --name mclinic-api
  echo "Waiting 30 seconds for API to start..."
  sleep 30
  curl -X POST http://localhost:3434/seeding/reset-fresh
}

echo "🏗️  Building Web App..."
cd ../web
npm install
npm run build
pm2 restart mclinic-web || pm2 start npm --name mclinic-web -- start

echo "✅ System Reinstall & Reset Complete!"
echo "👤 Admin Login: mettoalex@gmail.com / Digital2025"
pm2 status
