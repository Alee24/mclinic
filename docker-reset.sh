#!/bin/bash
# Stop on error
set -e

echo "🐳 Starting M-Clinic Docker CLEAN Reset..."

# 1. Update Code
echo "📥 Pulling latest code (MobileApp branch)..."
git fetch origin MobileApp
git reset --hard origin/MobileApp

# 2. Complete Shutdown
echo "🛑 Shutting down existing containers and wiping volumes..."
docker-compose down -v --remove-orphans
docker system prune -f

# 3. Rebuild and Start
echo "🛠️ Rebuilding and starting services..."
docker-compose up -d --build

# 4. Wait for DB and API
echo "⏳ Waiting for services to initialize (45 seconds)..."
sleep 45

# 5. Run Essential Seed inside the container
echo "🌱 Seeding Essential Data (Admin & Settings)..."
docker exec mclinic-api npx ts-node -r tsconfig-paths/register src/database/seed-essential.ts || {
  echo "⚠️ Standalone seed failed, trying via API endpoint..."
  curl -X POST http://localhost:7899/seeding/reset-fresh
}

echo "✅ System Reset Complete!"
echo "👤 Admin Login: mettoalex@gmail.com / Digital2025"
echo "🌐 Portal: https://portal.mclinic.co.ke"
docker-compose ps
