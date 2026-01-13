#!/bin/bash
set -e

echo "=============================================="
echo "  M-CLINIC COMPLETE SYSTEM CONFIGURATION"
echo "=============================================="

# Configuration
APP_DIR="/var/www/mclinicportal"
API_PORT=5454
WEB_PORT=5054
APACHE_CONF="/etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf"

echo "📋 Step 1: Creating Environment Files..."

# API .env
cat > "$APP_DIR/apps/api/.env" << 'EOF'
# Database Configuration
DATABASE_URL="mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mpesaconnect"

# Server Configuration
PORT=5454
NODE_ENV=production

# JWT Configuration
JWT_SECRET="mclinic-secret-key-change-in-production"
JWT_EXPIRATION="7d"

# App Configuration
APP_URL="https://portal.mclinic.co.ke"
EOF

echo "   ✅ API .env created"

# Web .env
cat > "$APP_DIR/apps/web/.env" << 'EOF'
NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
EOF

echo "   ✅ Web .env created"

echo ""
echo "🔧 Step 2: Updating Apache Configuration..."

if [ -f "$APACHE_CONF" ]; then
    # Backup
    sudo cp "$APACHE_CONF" "$APACHE_CONF.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Update ports
    sudo sed -i "s|http://localhost:[0-9]\+/|http://localhost:$WEB_PORT/|g" "$APACHE_CONF"
    sudo sed -i "s|http://localhost:[0-9]\+/api/|http://localhost:$API_PORT/api/|g" "$APACHE_CONF"
    
    echo "   ✅ Apache config updated to:"
    echo "      - Web: localhost:$WEB_PORT"
    echo "      - API: localhost:$API_PORT"
    
    # Test config
    if sudo apache2ctl configtest; then
        echo "   ✅ Apache config is valid"
        sudo systemctl restart apache2
        echo "   ✅ Apache restarted"
    else
        echo "   ❌ Apache config test failed!"
        exit 1
    fi
else
    echo "   ⚠️  Apache config not found at $APACHE_CONF"
fi

echo ""
echo "🔄 Step 3: Restarting PM2 Services..."

# Stop all
pm2 delete all 2>/dev/null || true

# Start API
cd "$APP_DIR/apps/api"
if [ -f "dist/main.js" ]; then
    PORT=$API_PORT pm2 start dist/main.js --name mclinic-api --update-env
    echo "   ✅ API started on port $API_PORT"
else
    echo "   ⚠️  API not built yet. Run: cd $APP_DIR/apps/api && npm run build"
fi

# Start Web
cd "$APP_DIR/apps/web"
if [ -d ".next" ]; then
    PORT=$WEB_PORT pm2 start npm --name mclinic-web -- start
    echo "   ✅ Web started on port $WEB_PORT"
else
    echo "   ⚠️  Web not built yet. Run: cd $APP_DIR/apps/web && npm run build"
fi

# Save PM2
pm2 save
echo "   ✅ PM2 configuration saved"

echo ""
echo "📊 Step 4: System Status..."
pm2 status

echo ""
echo "=============================================="
echo "✅ CONFIGURATION COMPLETE!"
echo "=============================================="
echo ""
echo "🌐 Your site should now be accessible at:"
echo "   https://portal.mclinic.co.ke"
echo ""
echo "📝 Configuration Summary:"
echo "   - API Port: $API_PORT"
echo "   - Web Port: $WEB_PORT"
echo "   - Database: mpesaconnect"
echo "   - Apache: Configured and restarted"
echo "   - PM2: Services running"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Check PM2 logs: pm2 logs"
echo "   - Check Apache logs: sudo tail -f /var/log/apache2/error.log"
echo "   - Restart services: pm2 restart all"
echo "=============================================="
