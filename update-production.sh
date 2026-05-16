#!/bin/bash
# M-Clinic Live Update Script
# Usage: ./update-production.sh
# This script updates the application code without affecting database volumes.

set -e

echo "---------------------------------------------------"
echo "🚀 Starting M-Clinic Secure Live Update"
echo "---------------------------------------------------"

# 1. Pull latest code from the frontend branch
echo "📡 [1/4] Pulling latest changes from branch: frontend..."
git pull origin frontend

# 2. Rebuild the application containers
echo "🏗️ [2/4] Rebuilding API and Web containers..."
docker-compose build --no-cache api web

# 3. Restart services without touching volumes
echo "🔄 [3/4] Restarting services (force recreate)..."
docker-compose up -d --force-recreate --no-deps api web

# 4. Run Migrations
echo "🗄️ [4/5] Running database migrations..."
docker-compose exec -T api sh -c "cd apps/api && npm run migration:run:prod"

# 5. Final Cleanup
echo "🧹 [5/5] Cleaning up unused Docker images..."
docker image prune -f

echo "---------------------------------------------------"
echo "✅ UPDATE SUCCESSFUL"
echo "🌐 Your live application is now running the latest version."
echo "📦 Volumes 'db_data' and 'uploads_data' were NOT affected."
echo "---------------------------------------------------"
