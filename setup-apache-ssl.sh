#!/bin/bash
set -e

echo "=============================================="
echo "  M-CLINIC APACHE SSL CONFIGURATION"
echo "  Setting up reverse proxy for ports 3434/3034"
echo "=============================================="

APACHE_CONF="/etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf"
BACKUP_CONF="/etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf.backup-$(date +%Y%m%d-%H%M%S)"

echo ""
echo "📋 Step 1: Backing up existing Apache configuration..."
if [ -f "$APACHE_CONF" ]; then
    sudo cp "$APACHE_CONF" "$BACKUP_CONF"
    echo "   ✅ Backup created: $BACKUP_CONF"
else
    echo "   ⚠️  No existing config found at $APACHE_CONF"
fi

echo ""
echo "📝 Step 2: Installing new Apache configuration..."
sudo cp apache-ssl.conf "$APACHE_CONF"
echo "   ✅ Configuration file copied"

echo ""
echo "🔧 Step 3: Enabling required Apache modules..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
echo "   ✅ All required modules enabled"

echo ""
echo "🔍 Step 4: Testing Apache configuration..."
if sudo apache2ctl configtest; then
    echo "   ✅ Apache configuration is valid"
else
    echo "   ❌ Apache configuration test failed!"
    echo "   Restoring backup..."
    if [ -f "$BACKUP_CONF" ]; then
        sudo cp "$BACKUP_CONF" "$APACHE_CONF"
        echo "   ✅ Backup restored"
    fi
    exit 1
fi

echo ""
echo "🔄 Step 5: Restarting Apache..."
sudo systemctl restart apache2
echo "   ✅ Apache restarted successfully"

echo ""
echo "=============================================="
echo "✅ APACHE SSL CONFIGURATION COMPLETE!"
echo "=============================================="
echo ""
echo "📊 Configuration Summary:"
echo "   - API Endpoint: https://portal.mclinic.co.ke/api → localhost:3434"
echo "   - Web Frontend: https://portal.mclinic.co.ke → localhost:3034"
echo "   - WebSocket Support: Enabled"
echo ""
echo "🔍 Verify Setup:"
echo "   - Check Apache status: sudo systemctl status apache2"
echo "   - View error logs: sudo tail -f /var/log/apache2/portal.mclinic.co.ke-error.log"
echo "   - View access logs: sudo tail -f /var/log/apache2/portal.mclinic.co.ke-access.log"
echo ""
echo "🌐 Test Your Site:"
echo "   - https://portal.mclinic.co.ke"
echo "   - https://portal.mclinic.co.ke/api/users/count-active"
echo "=============================================="
