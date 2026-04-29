#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/mclinicportal"
BRANCH="MobileApp"

echo "============================================="
echo "🚀 M-Clinic VPS Deployment (Branch: $BRANCH)"
echo "============================================="

# 1. Pull Latest Code
echo "📦 Fetching latest changes from $BRANCH..."
cd $APP_DIR
git fetch origin
git checkout $BRANCH
git reset --hard origin/$BRANCH

# 2. Run Database Patches
echo "🔧 Running Direct SQL Patch to fix missing columns..."
cd "$APP_DIR/apps/api"
npm install dotenv mysql2 bcrypt

cat > fix-db-vps-patch.js << 'EOF'
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log('Connecting to DB...');
    let config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mclinicportal',
        port: process.env.DB_PORT || 3306,
    };

    // Load credentials from ecosystem.config.js
    try {
        const pm2Config = require('../../ecosystem.config.js');
        const apiApp = pm2Config.apps.find(a => a.name === 'mclinic-api');
        if (apiApp && apiApp.env) {
            config.host = apiApp.env.DB_HOST || config.host;
            config.user = apiApp.env.DB_USER || config.user;
            config.password = apiApp.env.DB_PASSWORD || config.password;
            config.database = apiApp.env.DB_NAME || config.database;
            config.port = apiApp.env.DB_PORT || config.port;
            console.log('🔹 Extracted credentials from ecosystem.config.js');
        }
    } catch (e) {
        console.log('ℹ️ ecosystem.config.js fallback skipped:', e.message);
    }

    if (process.env.DATABASE_URL || config.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL || config.DATABASE_URL);
            config.host = url.hostname;
            config.port = url.port || 3306;
            config.user = url.username;
            config.password = decodeURIComponent(url.password);
            config.database = url.pathname.replace(/^\//, '');
            console.log('🔹 Parsed credentials from DATABASE_URL');
        } catch (e) {
            console.error('⚠️ Failed to parse DATABASE_URL:', e.message);
        }
    }

    const conn = await mysql.createConnection(config);

    // Columns to ensure in users table
    const columns = [
        { name: 'licenseNumber', type: 'VARCHAR(255) NULL' },
        { name: 'specialization', type: 'VARCHAR(255) NULL' },
        { name: 'bio', type: 'TEXT NULL' },
        { name: 'isPublic', type: 'TINYINT(1) DEFAULT 0' },
        { name: 'deletionRequestedAt', type: 'TIMESTAMP NULL' },
        { name: 'deletionScheduledAt', type: 'TIMESTAMP NULL' },
        { name: 'lastAccess', type: 'TIMESTAMP NULL' }
    ];

    for (const col of columns) {
        try {
            await conn.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added column: ${col.name}`);
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') {
                console.error(`⚠️ Error adding column ${col.name}:`, e.message);
            }
        }
    }

    // Ensure Admin User Exists
    const bcrypt = require('bcrypt');
    try {
        const hashedPassword = await bcrypt.hash('Digital2025', 10);
        // Check if email already exists to prevent integrity violation if unique key differs
        const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', ['mettoalex@gmail.com']);
        if (rows.length === 0) {
            await conn.query(`
                INSERT INTO users (email, password, role, fname, lname, status, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, ['mettoalex@gmail.com', hashedPassword, 'admin', 'Admin', 'User', 1]);
            console.log('✅ Admin user mettoalex@gmail.com created!');
        } else {
            await conn.query(`
                UPDATE users SET password = ?, role = ?, status = ? WHERE email = ?
            `, [hashedPassword, 'admin', 1, 'mettoalex@gmail.com']);
            console.log('✅ Admin user mettoalex@gmail.com updated!');
        }
    } catch (e) {
        console.error('⚠️ Error verifying admin user:', e.message);
    }

    await conn.end();
}
run().catch(e => { console.error(e); process.exit(1); });
EOF

node fix-db-vps-patch.js

# 3. API Deployment
echo "🔹 Updating API..."
cd "$APP_DIR/apps/api"
npm install --legacy-peer-deps
npx prisma generate
npm run build

# 3. Web Deployment
echo "🔹 Updating Web Frontend..."
cd "$APP_DIR/apps/web"
export NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
npm install --legacy-peer-deps
npm run build

# 4. Restart Services
echo "🔄 Starting/Restarting PM2 services..."
cd $APP_DIR
pm2 kill || true
pm2 start ecosystem.config.js --update-env

echo "✅ Deployment Successful!"
echo "============================================="
pm2 status
