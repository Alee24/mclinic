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

echo "🚀 Starting Full System Update..."

echo "📥 Updating code from repository..."
git fetch origin
git reset --hard origin/MobileApp

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔧 Building API..."
cd apps/api
npm install --legacy-peer-deps
npm run build

echo "🌱 Ensuring Essential Data (Admin & Settings)..."
# We use a standalone script to avoid needing the API to be running yet
npx ts-node -r tsconfig-paths/register src/database/seed-essential.ts || {
  echo "⚠️  Standalone maintenance failed, trying via API endpoint..."
  pm2 restart mclinic-api --update-env || PORT=7899 pm2 start dist/main.js --name mclinic-api
  echo "Waiting 10 seconds for API to start..."
  sleep 10
  curl -X POST http://localhost:7899/api/seeding/settings
}

echo "🏗️  Building Web App..."
cd ../web
npm install
npm run build
pm2 restart mclinic-web || pm2 start npm --name mclinic-web -- start

echo "✅ System Reinstall & Reset Complete!"
echo "👤 Admin Login: mettoalex@gmail.com / Digital2025"
pm2 status
