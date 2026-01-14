#!/bin/bash

# M-Clinic Database Fix Script
# This script fixes the production database schema issues

echo "🔧 Fixing M-Clinic Production Database..."

cd /var/www/mclinicportal

# Step 1: Run the SQL migration to add missing columns
echo "📝 Step 1: Adding missing columns to users table..."
mysql -u m-cl-app -p'Mclinic@App2023?' mclinicportal << 'EOF'
-- Add missing columns to users table
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `role` ENUM('patient', 'doctor', 'admin', 'lab_tech', 'nurse', 'clinician', 'medic', 'finance', 'pharmacist') NOT NULL DEFAULT 'patient' AFTER `password`;

ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `emailVerifiedAt` TIMESTAMP NULL AFTER `status`;

ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `national_id` VARCHAR(255) NULL AFTER `mobile`;

ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `resetToken` VARCHAR(255) NULL AFTER `updated_at`;

ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`;

SELECT '✅ Columns added successfully!' AS Status;
DESCRIBE `users`;
EOF

# Step 2: Downgrade Prisma to version 5.x (compatible version)
echo "📦 Step 2: Installing compatible Prisma version..."
cd /var/www/mclinicportal/apps/api
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-exact

# Step 3: Generate Prisma Client
echo "✅ Step 3: Generating Prisma Client..."
npx prisma generate

# Step 4: Restart API
echo "🔄 Step 4: Restarting API service..."
cd /var/www/mclinicportal
pm2 restart mclinic-api

echo "✅ All done! Checking API status..."
sleep 3
pm2 logs mclinic-api --lines 20 --nostream

echo ""
echo "🎉 Database fix complete!"
echo "📊 Test the API with: curl http://localhost:5454/health"
