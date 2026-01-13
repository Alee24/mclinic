#!/bin/bash
set -e

echo "=============================================="
echo "    M-CLINIC ENV SETUP SCRIPT"
echo "=============================================="

# Define paths
API_ENV_PATH="/var/www/mclinicportal/apps/api/.env"
WEB_ENV_PATH="/var/www/mclinicportal/apps/web/.env"

# Define the content for the API .env file
# Using the credentials provided by the user
API_ENV_CONTENT='
# Database Configuration
DATABASE_URL="mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mpesaconnect"

# Server Configuration
PORT=5454
NODE_ENV=production

# JWT Secrets (Generated placeholders - replace if you have specific ones)
JWT_SECRET="mclinic-secret-key-change-me-in-production"
JWT_EXPIRATION="7d"

# App URL
APP_URL="https://portal.mclinic.co.ke"
'

# Define the content for the Web .env file
WEB_ENV_CONTENT='
NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
'

echo "🔧 1. Creating API .env file at $API_ENV_PATH..."
# We use printf to handle newlines correctly
printf "%s" "$API_ENV_CONTENT" | sudo tee "$API_ENV_PATH" > /dev/null
echo "   ✅ API .env created."

echo "🔧 2. Creating Web .env file at $WEB_ENV_PATH..."
printf "%s" "$WEB_ENV_CONTENT" | sudo tee "$WEB_ENV_PATH" > /dev/null
echo "   ✅ Web .env created."

echo "=============================================="
echo "✅ ENVIRONMENT SETUP COMPLETE"
echo "=============================================="
