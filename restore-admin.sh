#!/bin/bash
cd /var/www/mclinicportal/apps/api
npm install mysql2 dotenv > /dev/null 2>&1
node scripts/restore_admin.js
