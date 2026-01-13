#!/bin/bash

# Configuration
APP_DIR="/var/www/mclinicportal"
API_PORT=3434
WEB_PORT=3034
API_NAME="mclinic-api"
WEB_NAME="mclinic-web"

echo "=================================================="
echo "🚀 M-Clinic Portal: Restart & Verify Script"
echo "=================================================="

# 1. Update Database & Client (Crucial Fix)
echo "🔹 [Step 1/3] Updating Database Schema..."

if [ -d "$APP_DIR/apps/api" ]; then
    cd "$APP_DIR/apps/api"
    SCHEMA_FILE="prisma/schema.prisma"
    
    # --- AUTO-PATCH: Fix Missing resetToken ---
    if ! grep -q "resetToken" "$SCHEMA_FILE"; then
        echo "🔧 Patching Schema: Adding resetToken..."
        # Insert resetToken fields after profile_image
        sed -i '/profile_image.*String/a \  resetToken      String?   @db.VarChar(255)\n  resetTokenExpiry DateTime? @db.Timestamp(0)' "$SCHEMA_FILE"
    fi

    # --- AUTO-PATCH: Fix Missing AmbulancePackage ---
    if ! grep -q "model AmbulancePackage" "$SCHEMA_FILE"; then
         echo "🔧 Patching Schema: Adding AmbulancePackage..."
         cat >> "$SCHEMA_FILE" <<EOF

model AmbulancePackage {
  id            Int      @id @default(autoincrement())
  name          String   @unique
  description   String?  @db.Text
  price         Decimal  @db.Decimal(10, 2)
  validity_days Int      @default(365)
  features      Json?
  max_adults    Int      @default(0)
  max_children  Int      @default(0)
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now()) @db.DateTime(6)
  updated_at    DateTime @default(now()) @updatedAt @db.DateTime(6)

  @@map("ambulance_packages")
}
EOF
    fi

    echo "   > Running Prisma DB Push..."
    npx prisma db push
    echo "   > Generating Prisma Client..."
    npx prisma generate
else
    echo "❌ Error: Cannot find apps/api directory at $APP_DIR/apps/api"
    exit 1
fi

# 2. Restart Services
echo "🔹 [Step 2/3] Restarting Services..."
pm2 restart $API_NAME --update-env || echo "   ⚠️  Could not restart $API_NAME (might not be running)"
pm2 restart $WEB_NAME --update-env || echo "   ⚠️  Could not restart $WEB_NAME (might not be running)"

echo "⏳ Waiting 15 seconds for services to stabilize..."
sleep 15

# 3. Verify Connectivity
echo "🔹 [Step 3/3] Verifying Connectivity..."

# API Verification
API_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:$API_PORT/ || true)
if [[ "$API_STATUS" == "200" ]] || [[ "$API_STATUS" == "404" ]]; then
    echo "✅ API is ONLINE (Response Code: $API_STATUS)"
else
    echo "❌ API seems DOWN (Response Code: $API_STATUS)"
    echo "   ⚠️  Checking recent API logs:"
    pm2 logs $API_NAME --lines 20 --nostream
fi

# Web Verification
WEB_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:$WEB_PORT || true)
if [[ "$WEB_STATUS" == "200" ]]; then
    echo "✅ Web Frontend is ONLINE"
else
    echo "❌ Web Frontend seems DOWN (Response Code: $WEB_STATUS)"
fi

echo "=================================================="
echo "📊 Current PM2 Status:"
pm2 status
echo "=================================================="
