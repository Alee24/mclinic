#!/bin/bash

# Configuration
API_URL="http://localhost:3434" # Correct port matching ecosystem.config.js
EMAIL="mettoalex@gmail.com"
PASSWORD="Digital2025"

echo "==================================================="
echo "   M-Clinic Doctor Synchronization Script"
echo "==================================================="

# 1. Login to get Access Token
echo "[1/2] Logging in as Admin ($EMAIL)..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"userType\": \"patient\"}")

# Extract Token (Basic parsing)
# Access token is typically in {"access_token":"..."}
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ Login Failed."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login Successful."

# 2. Call Sync Endpoint
echo "[2/2] Triggering Synchronization..."
SYNC_RESPONSE=$(curl -s -X POST "$API_URL/doctors/admin/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "✅ Sync Completed."
echo "Response: $SYNC_RESPONSE"
echo "==================================================="
