#!/bin/bash
set -e

echo "=============================================="
echo "    M-CLINIC FULL STACK RESTART SCRIPT"
echo "=============================================="

# 1. Configuration
API_PORT=5454
WEB_PORT=5054
APP_DIR="/var/www/mclinicportal"

echo "🔄 1. Refreshing Codebase..."
git fetch origin
git reset --hard origin/main
git clean -fd

# 2. Update Apache Config (Requires Sudo)
# We use sed to replace the proxy ports dynamically in the apache config
APACHE_CONF="/etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf"

if [ -f "$APACHE_CONF" ]; then
    echo "🔧 2. Updating Apache Proxy Configuration..."
    
    # Backup original
    sudo cp $APACHE_CONF "$APACHE_CONF.bak"

    # Update web port to 5054 (handling potential existing 3000 or 5054)
    sudo sed -i -E "s|ProxyPass / http://localhost:[0-9]+/|ProxyPass / http://localhost:$WEB_PORT/|g" $APACHE_CONF
    sudo sed -i -E "s|ProxyPassReverse / http://localhost:[0-9]+/|ProxyPassReverse / http://localhost:$WEB_PORT/|g" $APACHE_CONF

    # Update API port to 5454 (handling potential existing 3434 or 5454)
    sudo sed -i -E "s|ProxyPass /api/ http://localhost:[0-9]+/api/|ProxyPass /api/ http://localhost:$API_PORT/api/|g" $APACHE_CONF
    sudo sed -i -E "s|ProxyPassReverse /api/ http://localhost:[0-9]+/api/|ProxyPassReverse /api/ http://localhost:$API_PORT/api/|g" $APACHE_CONF

    echo "   - Web Proxy set to port $WEB_PORT"
    echo "   - API Proxy set to port $API_PORT"
    
    # Test Apache Config
    if sudo apache2ctl configtest; then
        echo "✅ Apache config is valid. Restarting Apache..."
        sudo systemctl restart apache2
    else
        echo "❌ Apache config test failed! Restoring backup..."
        sudo cp "$APACHE_CONF.bak" $APACHE_CONF
        exit 1
    fi
else
    echo "⚠️ Apache config file not found at $APACHE_CONF. Skipping Apache update."
fi

# 3. Deploy App with New Ports
echo "🚀 3. Launching Application Deployment..."

# Ensure permissions
chmod +x deploy-portal.sh

# Run deployment
./deploy-portal.sh

echo "=============================================="
echo "✅ FULL SYSTEM RESTART COMPLETE"
echo "   - Apache Proxy Updated & Restarted"
echo "   - Codebase Refreshed"
echo "   - App Deployed on Ports $API_PORT (API) & $WEB_PORT (Web)"
echo "=============================================="
