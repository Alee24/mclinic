#!/bin/bash

# M-Clinic Docker Deployment Script
echo "🚀 Starting M-Clinic Docker Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# 2. Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# 3. Build and start services
echo "🛠️ Building and starting services (this may take a few minutes)..."
docker-compose up -d --build

# 4. Wait for DB to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# 5. Run migrations (Targeting the running container)
echo "🔄 Running database migrations..."
docker exec mclinic-api npm run migration:run:prod

# 6. Show status
echo "✅ Deployment complete! Current status:"
docker-compose ps

echo "🌐 Portal: https://portal.mclinic.co.ke"
echo "📡 API: https://portal.mclinic.co.ke/api"
