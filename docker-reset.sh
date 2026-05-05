#!/bin/bash
# Stop on error
set -e

echo "🐳 Starting M-Clinic Docker CLEAN Reset..."

# 1. Update Code
echo "📥 Pulling latest code (MobileApp branch)..."
git fetch origin MobileApp
git reset --hard origin/MobileApp

# 2. Complete Shutdown
echo "🛑 Stopping existing PM2 processes and Docker containers..."
pm2 stop all || true
pm2 delete all || true
docker-compose down -v --remove-orphans
docker system prune -f

# 3. Rebuild and Start
echo "🛠️ Rebuilding and starting services..."
docker-compose up -d --build

# 4. Wait for API to be ready
echo "⏳ Waiting for API to be fully online..."
for i in {1..30}; do
  if curl -s http://localhost:7899 > /dev/null; then
    echo "✅ API is up!"
    break
  fi
  echo "Still waiting... ($i/30)"
  sleep 5
done

# 5. Run Essential Seed inside the container
echo "🌱 Seeding Essential Data (Admin & Settings)..."
# Inside the container, the path is /app/apps/api/src/database/seed-essential.ts
docker exec mclinic-api npx ts-node -r tsconfig-paths/register apps/api/src/database/seed-essential.ts || {
  echo "⚠️ Standalone seed failed, trying via API endpoint..."
  curl -X POST http://localhost:7899/seeding/reset-fresh
}

echo "✅ System Reset Complete!"
echo "👤 Admin Login: mettohalex@gmail.com / Digital2025"
echo "🌐 Portal: https://portal.mclinic.co.ke"
docker-compose ps
