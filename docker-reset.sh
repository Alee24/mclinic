#!/bin/bash
# Stop on error
set -e

echo "🐳 Starting M-Clinic Docker Update..."

# 1. Update Code
echo "📥 Pulling latest code (MobileApp branch)..."
git fetch origin MobileApp
git reset --hard origin/MobileApp

# 2. Complete Shutdown (Safe Mode)
echo "🛑 Stopping existing PM2 processes and Docker containers..."
pm2 stop all || true
pm2 delete all || true
docker-compose down --remove-orphans # Removed -v to preserve data

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

# 5. Run Essential Maintenance inside the container
echo "🌱 Ensuring Essential Data exists..."
# We no longer use reset-fresh as it's destructive. 
# The seeding service now checks for existing data before adding.
if curl -s -X POST http://localhost:7899/api/seeding/settings | grep -q "message"; then
  echo "✅ Settings Verified!"
else
  echo "⚠️ API settings check failed, trying standalone script..."
  docker exec mclinic-api npx ts-node apps/api/src/database/seed-essential.ts || echo "❌ Maintenance script failed. Please check logs."
fi

echo "✅ System Reset Complete!"
echo "👤 Admin Login: mettohalex@gmail.com / Digital2025"
echo "🌐 Portal: https://portal.mclinic.co.ke"
docker-compose ps
