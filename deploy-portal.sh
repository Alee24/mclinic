#!/bin/bash
set -e

# Configuration
echo "🔄 Pulling latest code..."
git pull origin main

APP_DIR="/var/www/mclinicportal"
API_PORT=3434
WEB_PORT=3034
API_NAME="mclinic-api"
WEB_NAME="mclinic-web"

# Adjust these if your folder structure is different
API_PATH="apps/api"
WEB_PATH="apps/web"

echo "🚀 Deploying M-Clinic Portal..."

# --- 1. API Deployment ---
echo "🔹 Setting up API..."
cd "$APP_DIR/$API_PATH"

# Install & Build
npm install --legacy-peer-deps
npm run build

npm run build

# --- Fix Database Schema (Direct SQL Patch) ---
echo "🔧 Running Direct SQL Patch to fix missing columns..."
npm install dotenv mysql2

cat > fix-db-patch.js << 'EOF'
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log('Connecting to DB...');
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mclinic',
        port: process.env.DB_PORT || 3306,
    });

    // 1. Add resetToken
    try {
        await conn.query('ALTER TABLE users ADD COLUMN resetToken VARCHAR(255) NULL');
        console.log('✅ Added resetToken');
    } catch (e) { 
        if(e.code !== 'ER_DUP_FIELDNAME') console.log('Info:', e.message); 
    }

    try {
         await conn.query('ALTER TABLE users ADD COLUMN resetTokenExpiry TIMESTAMP NULL');
         console.log('✅ Added resetTokenExpiry');
    } catch (e) { 
        if(e.code !== 'ER_DUP_FIELDNAME') console.log('Info:', e.message); 
    }

    // 2. Ensure Tables exist
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ambulance_packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(191) UNIQUE NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                validity_days INT DEFAULT 365,
                features JSON,
                max_adults INT DEFAULT 0,
                max_children INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
            )
        `);
        console.log('✅ Verified ambulance_packages table');
    } catch (e) { console.error('Table error:', e.message); }
    
    try {
         await conn.query(`
            CREATE TABLE IF NOT EXISTS system_setting (
                \`key\` VARCHAR(191) PRIMARY KEY,
                value TEXT NOT NULL,
                description VARCHAR(191),
                isSecure TINYINT(1) DEFAULT 0
            )
         `);
         console.log('✅ Verified system_setting table');
    } catch (e) { console.error('Settings error:', e.message); }

    await conn.end();
}
run().catch(e => { console.error(e); process.exit(1); });
EOF

node fix-db-patch.js

# Sync Prisma just in case (but rely on SQL patch)
if [ -f "prisma/schema.prisma" ]; then
    echo "⚙️  Generating Prisma Client (using local version)..."
    ./node_modules/.bin/prisma generate || npx prisma generate
fi

# Start API on Port 3434
echo "🔄 Starting API ($API_NAME) on port $API_PORT..."
pm2 delete $API_NAME 2>/dev/null || true
PORT=$API_PORT pm2 start dist/main.js --name $API_NAME --update-env

# --- 2. Web Deployment ---
echo "🔹 Setting up Web Frontend..."
cd "$APP_DIR/$WEB_PATH"

# Set API URL for the build
# We assume Apache proxies /api to localhost:3434
export NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api" 
export PORT=$WEB_PORT

# Install & Build
npm install --legacy-peer-deps
echo "🏗️  Building Next.js app..."
npm run build

# Start Web on Port 3034
echo "🔄 Starting Web ($WEB_NAME) on port $WEB_PORT..."
pm2 delete $WEB_NAME 2>/dev/null || true
PORT=$WEB_PORT pm2 start npm --name $WEB_NAME -- start

# Save PM2 list
pm2 save

echo "✅ Deployment Complete!"
echo "   - API running on Port $API_PORT ($API_NAME)"
echo "   - Web running on Port $WEB_PORT ($WEB_NAME)"
pm2 status
