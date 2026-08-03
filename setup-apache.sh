#!/bin/bash

# Apache Configuration Script for M-Clinic
set -e

echo "🔧 Configuring Apache for M-Clinic..."

# 1. Enable required modules
echo "🔌 Enabling Apache modules..."
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod ssl
a2enmod headers

# 2. Copy configuration
echo "📄 Copying site configuration..."
if [ -f "apache.conf" ]; then
    cp apache.conf /etc/apache2/sites-available/mclinic.conf
else
    echo "❌ Error: apache.conf not found!"
    exit 1
fi

# 3. Enable site
echo "🟢 Enabling site..."
a2dissite 000-default.conf || true
a2ensite mclinic.conf

# 4. Check configuration
echo "🔍 Checking configuration..."
apache2ctl configtest

# 5. Restart Apache
echo "🔄 Restarting Apache..."
systemctl restart apache2

echo "✅ Apache configured successfully!"
echo "   - Frontend: https://portal.mclinic.co.ke -> port 7898"
echo "   - API: https://portal.mclinic.co.ke/api -> port 7899"
