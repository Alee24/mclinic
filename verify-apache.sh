#!/bin/bash

echo "=============================================="
echo "  M-CLINIC APACHE VERIFICATION"
echo "=============================================="

echo ""
echo "📋 Apache Status:"
sudo systemctl status apache2 --no-pager

echo ""
echo "🔍 Enabled Sites:"
ls -la /etc/apache2/sites-enabled/

echo ""
echo "📝 Current Configuration:"
echo "   SSL Config: /etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf"
sudo cat /etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf | grep -E "ProxyPass|ServerName|Port"

echo ""
echo "🔧 Enabled Modules:"
apache2ctl -M | grep -E "proxy|rewrite|ssl|headers"

echo ""
echo "✅ Configuration Test:"
sudo apache2ctl configtest

echo ""
echo "🌐 Testing Endpoints:"
echo ""
echo "   Testing API (should return JSON):"
curl -s http://localhost:3434/users/count-active | head -20
echo ""
echo ""
echo "   Testing Web (should return HTML):"
curl -s http://localhost:3034 | head -20
echo ""

echo ""
echo "📊 Recent Error Logs:"
sudo tail -20 /var/log/apache2/portal.mclinic.co.ke-error.log

echo ""
echo "=============================================="
