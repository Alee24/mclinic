#!/bin/bash
set -e

echo "=============================================="
echo "  M-CLINIC COMPLETE FRESH INSTALLATION"
echo "  Ports: API=5454, Web=5054"
echo "=============================================="

# Configuration
APP_DIR="/var/www/mclinicportal"
API_PORT=5454
WEB_PORT=5054
DB_NAME="mclinicportal"
DB_USER="m-cl-app"
DB_PASS="Mclinic@App2023?"
REPO_URL="https://github.com/Alee24/mclinic.git"

echo ""
echo "⚠️  WARNING: This will completely remove and reinstall M-Clinic"
echo "   - All PM2 processes will be stopped"
echo "   - Application directory will be deleted"
echo "   - Fresh code will be cloned from GitHub"
echo "   - Dependencies will be reinstalled"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Installation cancelled."
    exit 1
fi

echo ""
echo "📋 Step 1: Stopping all services..."
pm2 delete all 2>/dev/null || true
sudo lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
sudo lsof -ti:$WEB_PORT | xargs kill -9 2>/dev/null || true
echo "   ✅ All services stopped"

echo ""
echo "🗑️  Step 2: Removing old installation..."
if [ -d "$APP_DIR" ]; then
    sudo rm -rf "$APP_DIR"
    echo "   ✅ Old installation removed"
else
    echo "   ℹ️  No existing installation found"
fi

echo ""
echo "📥 Step 3: Cloning fresh code from GitHub..."
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"
echo "   ✅ Code cloned successfully"

echo ""
echo "🔧 Step 4: Setting up Node.js 20..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 || nvm install 20
node -v
echo "   ✅ Node.js 20 activated"

echo ""
echo "📦 Step 5: Installing dependencies..."
npm install --legacy-peer-deps
echo "   ✅ Dependencies installed"

echo ""
echo "📝 Step 6: Creating environment files..."

# API .env
cat > "$APP_DIR/apps/api/.env" << 'APIENV'
DATABASE_URL="mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal"
PORT=5454
NODE_ENV=production
JWT_SECRET="mclinic-secret-key-production-2026"
JWT_EXPIRATION="7d"
APP_URL="https://portal.mclinic.co.ke"
APIENV

echo "   ✅ API .env created"

# Web .env.production
cat > "$APP_DIR/apps/web/.env.production" << 'WEBENV'
NEXT_PUBLIC_API_URL="https://portal.mclinic.co.ke/api"
NODE_ENV=production
WEBENV

echo "   ✅ Web .env.production created"

echo ""
echo "🔧 Step 7: Configuring Apache..."
sudo cp "$APP_DIR/apache-ssl.conf" /etc/apache2/sites-available/portal.mclinic.co.ke-le-ssl.conf

# Enable required modules
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite ssl headers 2>/dev/null || true

# Test and restart Apache
sudo apache2ctl configtest
sudo systemctl restart apache2
echo "   ✅ Apache configured and restarted"

echo ""
echo "🗄️  Step 8: Setting up database..."
cd "$APP_DIR/apps/api"

# Generate Prisma client
npx prisma generate --schema=prisma/schema.prisma

# Push schema to database
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss

echo "   ✅ Database schema applied"

echo ""
echo "🏗️  Step 9: Building API..."
cd "$APP_DIR/apps/api"
npm run build
echo "   ✅ API built successfully"

echo ""
echo "🌐 Step 10: Building Web..."
cd "$APP_DIR/apps/web"
NEXT_DISABLE_TYPE_CHECK=true npm run build
echo "   ✅ Web built successfully"

echo ""
echo "📋 Step 11: Creating PM2 ecosystem..."
cat > "$APP_DIR/ecosystem.config.js" << 'PMEOF'
module.exports = {
  apps: [
    {
      name: 'mclinic-api',
      script: 'dist/main.js',
      cwd: '/var/www/mclinicportal/apps/api',
      interpreter: '/root/.nvm/versions/node/v20.20.0/bin/node',
      env_file: '/var/www/mclinicportal/apps/api/.env',
      env: {
        PORT: 5454,
        NODE_ENV: 'production',
        DATABASE_URL: 'mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal',
        JWT_SECRET: 'mclinic-secret-key-production-2026',
        JWT_EXPIRATION: '7d',
        APP_URL: 'https://portal.mclinic.co.ke'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/mclinicportal/logs/api-error.log',
      out_file: '/var/www/mclinicportal/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'mclinic-web',
      script: '/root/.nvm/versions/node/v20.20.0/bin/npm',
      args: 'start',
      cwd: '/var/www/mclinicportal/apps/web',
      env: {
        PORT: 5054,
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://portal.mclinic.co.ke/api'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/mclinicportal/logs/web-error.log',
      out_file: '/var/www/mclinicportal/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
PMEOF

echo "   ✅ PM2 ecosystem created"

echo ""
echo "🚀 Step 12: Starting services with PM2..."
mkdir -p "$APP_DIR/logs"
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup
echo "   ✅ Services started"

echo ""
echo "⏳ Step 13: Waiting for services to initialize..."
sleep 10

echo ""
echo "🔍 Step 14: Testing endpoints..."
echo ""
echo "Testing API (port $API_PORT):"
curl -s http://localhost:$API_PORT/users/count-active || echo "   ⚠️  API not responding yet (may need more time)"

echo ""
echo ""
echo "Testing Web (port $WEB_PORT):"
curl -s http://localhost:$WEB_PORT | head -20

echo ""
echo ""
echo "=============================================="
echo "✅ FRESH INSTALLATION COMPLETE!"
echo "=============================================="
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 Your Application:"
echo "   - Website: https://portal.mclinic.co.ke"
echo "   - API: https://portal.mclinic.co.ke/api"
echo ""
echo "🔍 Check Services:"
echo "   - API Health: curl http://localhost:$API_PORT/users/count-active"
echo "   - Web Health: curl http://localhost:$WEB_PORT"
echo ""
echo "📝 View Logs:"
echo "   - pm2 logs mclinic-api"
echo "   - pm2 logs mclinic-web"
echo "   - pm2 logs (both)"
echo ""
echo "🔄 Manage Services:"
echo "   - pm2 restart all"
echo "   - pm2 stop all"
echo "   - pm2 delete all"
echo ""
echo "⚙️  Configuration:"
echo "   - API Port: $API_PORT"
echo "   - Web Port: $WEB_PORT"
echo "   - Database: $DB_NAME"
echo "   - Node.js: $(node -v)"
echo "=============================================="
