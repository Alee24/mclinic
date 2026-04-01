#!/bin/bash
set -e

# ==============================================================
# M-CLINIC AUTOMATED VPS RECONFIGURATION SCRIPT
# This script will reconfigure ports 7899 (API) and 7898 (Web)
# and rewrite the Apache configuration.
# ==============================================================

echo "🚀 Starting Full Automation..."

APP_DIR="/var/www/mclinicportal"
API_PORT=7899
WEB_PORT=7898
DOMAIN="portal.mclinic.co.ke"
APACHE_FILE="/etc/apache2/sites-available/$DOMAIN-le-ssl.conf"

# 1. Update .env files
echo "📝 Updating API .env configuration..."
cd "$APP_DIR/apps/api"
if [ -f .env ]; then
  sed -i "s/^PORT=.*/PORT=$API_PORT/" .env
  sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=http://localhost:$WEB_PORT|" .env
  sed -i "s|^MPESA_CALLBACK_URL=.*|MPESA_CALLBACK_URL=http://localhost:$API_PORT/payments/mpesa/callback|" .env
  echo "✅ API .env updated."
else
  echo "⚠️  API .env not found! Skipping..."
fi

# 2. Re-pull LATEST code and Standardize Ecosystem
echo "📥 Syncing latest code and ecosystem config..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/main
echo "✅ Code sync complete."

# 3. Rewrite Apache Config
echo "🔧 Rewriting Apache configuration at $APACHE_FILE..."

cat <<EOF | sudo tee $APACHE_FILE > /dev/null
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName $DOMAIN
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/$DOMAIN/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    
    ProxyPreserveHost On
    ProxyRequests Off
    
    # MClinic API - Port $API_PORT
    ProxyPass /api/ http://127.0.0.1:$API_PORT/
    ProxyPassReverse /api/ http://127.0.0.1:$API_PORT/
    
    # MClinic Web - Port $WEB_PORT
    ProxyPass / http://127.0.0.1:$WEB_PORT/
    ProxyPassReverse / http://127.0.0.1:$WEB_PORT/
    
    # WebSocket support for port $WEB_PORT
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://127.0.0.1:$WEB_PORT/\$1 [P,L]
    
    ErrorLog \${APACHE_LOG_DIR}/$DOMAIN-error.log
    CustomLog \${APACHE_LOG_DIR}/$DOMAIN-access.log combined
</VirtualHost>
</IfModule>
EOF

# Ensure the symlink is active
sudo ln -sf $APACHE_FILE /etc/apache2/sites-enabled/

# 4. Enable Modules and Restart Apache
echo "🔄 Enabling Apache modules and restarting..."
sudo a2enmod proxy proxy_http rewrite ssl > /dev/null 2>&1
if sudo apache2ctl configtest; then
  sudo systemctl restart apache2
  echo "✅ Apache restarted successfully."
else
  echo "❌ Apache configuration test failed! Please check logs."
  exit 1
fi

# 5. Restart PM2 Services
echo "🔄 Restarting PM2 services on new ports..."
cd "$APP_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "✅ PM2 services set to $API_PORT and $WEB_PORT."

echo ""
echo "=============================================="
echo "🎉 ALL SYSTEMS CONFIGURED & ONLINE!"
echo "=============================================="
echo "🌐 Site: https://$DOMAIN"
echo "🔌 API:  https://$DOMAIN/api"
echo "=============================================="
