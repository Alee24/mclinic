#!/bin/bash
echo "🛠️ Manually Fixing Database Schema..."
cd /var/www/mclinicportal/apps/api

# Ensure dependencies installed (for mysql2)
if [ ! -d "node_modules" ]; then
    npm install
fi

# Run the fix script
node scripts/manual_fix_role.js

# Restart API
echo "🔄 Restarting API..."
pm2 restart mclinic-api
pm2 logs mclinic-api --lines 20 --nostream
