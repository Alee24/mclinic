#!/bin/bash
echo "🔄 Switching Database to 'mclinicportal'..."

ENV_FILE="/var/www/mclinicportal/apps/api/.env"

# Update .env file
if grep -q "DB_NAME=" "$ENV_FILE"; then
    sed -i 's/DB_NAME=.*/DB_NAME=mclinicportal/' "$ENV_FILE"
else
    echo "DB_NAME=mclinicportal" >> "$ENV_FILE"
fi

echo "✅ Updated .env to use DB_NAME=mclinicportal"

# Re-run fixes on the new DB
echo "🛠️ applying fixes to 'mclinicportal'..."
cd /var/www/mclinicportal
./fix-role.sh
./restore-admin.sh

echo "🚀 Restarting API..."
pm2 restart mclinic-api
pm2 logs mclinic-api --lines 20 --nostream
