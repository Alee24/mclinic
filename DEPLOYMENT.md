# M-Clinic Production Deployment Guide

Complete guide to deploy M-Clinic to your production server.

## 📋 Pre-requisites

- Ubuntu/Debian Linux server (20.04 or later)
- Domain name pointed to your server (e.g., portal.mclinic.co.ke)
- Root or sudo access
- At least 2GB RAM, 20GB disk space

## 🚀 Quick Deploy (Using install.sh)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/mclinic.git
cd mclinic

# 2. Make installer executable
chmod +x install.sh

# 3. Run installer (installs everything automatically)
sudo ./install.sh

# 4. Configure environment
sudo nano /var/www/mclinic/apps/api/.env
sudo nano /var/www/mclinic/apps/web/.env.production.local

# 5. Restart services
sudo systemctl restart mclinic-api
sudo systemctl restart mclinic-web
sudo systemctl restart nginx
```

## 📦 Manual Installation

### Step 1: System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p

CREATE DATABASE mclinic;
CREATE USER 'mclinic_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON mclinic.* TO 'mclinic_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Application Setup

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/mclinic.git
cd mclinic

# Install dependencies
npm install

# Build applications
cd apps/api
npm run build
cd ../web
npm run build
cd ../..
```

### Step 4: Environment Configuration

**API (.env):**
```bash
sudo nano /var/www/mclinic/apps/api/.env
```
Copy contents from `ENV_PRODUCTION_TEMPLATE.txt` and update values.

**Frontend (.env.production.local):**
```bash
sudo nano /var/www/mclinic/apps/web/.env.production.local
```
Add:
```
NEXT_PUBLIC_API_URL=https://portal.mclinic.co.ke/api
```

### Step 5: Run Database Migrations

```bash
cd /var/www/mclinic/apps/api
npm run migration:run
npm run seed  # Optional: seed initial data
```

### Step 6: PM2 Services

**Start API:**
```bash
cd /var/www/mclinic/apps/api
pm2 start dist/main.js --name mclinic-api
pm2 save
pm2 startup
```

**Start Frontend:**
```bash
cd /var/www/mclinic/apps/web
pm2 start npm --name mclinic-web -- start
pm2 save
```

### Step 7: Nginx Configuration

```bash
# Copy nginx config
sudo cp /var/www/mclinic/nginx.conf /etc/nginx/sites-available/mclinic
sudo ln -s /etc/nginx/sites-available/mclinic /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d portal.mclinic.co.ke -d www.portal.mclinic.co.ke

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

## 🔒 Security Checklist

- [ ] Changed default MySQL root password
- [ ] Created dedicated MySQL user with limited privileges
- [ ] Set strong JWT_SECRET (64+ characters)
- [ ] Updated MAIL credentials
- [ ] Configured M-Pesa production credentials
- [ ] Enabled firewall (ufw)
- [ ] SSL certificate installed
- [ ] Environment files secured (permissions 600)
- [ ] Removed .git folder from web-accessible directories
- [ ] Set up regular backups

## 🔥 Firewall Setup

```bash
# Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Monitoring

**Check API Status:**
```bash
pm2 status
pm2 logs mclinic-api
```

**Check Frontend Status:**
```bash
pm2 logs mclinic-web
```

**Check Nginx Status:**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Check MySQL:**
```bash
sudo systemctl status mysql
```

## 🔄 Updates & Maintenance

**Update Application:**
```bash
cd /var/www/mclinic
git pull origin main
npm install
cd apps/api && npm run build
cd ../web && npm run build
pm2 restart all
```

**Database Backup:**
```bash
mysqldump -u mclinic_user -p mclinic > backup_$(date +%Y%m%d).sql
```

**Restore Database:**
```bash
mysql -u mclinic_user -p mclinic < backup_20260112.sql
```

## 🌍 Domain & DNS Setup

Point your domain to your server's IP:

```
A Record:  portal.mclinic.co.ke → YOUR_SERVER_IP
A Record:  www.portal.mclinic.co.ke → YOUR_SERVER_IP
```

## 📱 Post-Deployment

1. **Test Login:** https://portal.mclinic.co.ke/login
2. **Test API:** https://portal.mclinic.co.ke/api/health
3. **Configure Payment Gateways:** Admin Panel > Payment Gateways
4. **Set Email Notifications:** Admin Panel > Notifications
5. **Test M-Pesa:** Admin Panel > M-Pesa Config > Test Connection

## 🆘 Troubleshooting

**API not starting:**
```bash
pm2 logs mclinic-api --err
# Check .env file
# Check database connection
```

**Frontend not loading:**
```bash
pm2 logs mclinic-web
# Check NEXT_PUBLIC_API_URL
# Run: pm2 restart mclinic-web
```

**Database connection failed:**
```bash
# Test MySQL connection
mysql -u mclinic_user -p
# Check DB_HOST, DB_PORT, DB_USER, DB_PASS in .env
```

**Nginx 502 Bad Gateway:**
```bash
# Check if services are running
pm2 status
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 📞 Support

- Email: info@portal.mclinic.co.ke
- Phone: 0700448448
- Documentation: See README files

---

**Production URLs:**
- Frontend: https://portal.mclinic.co.ke
- API: https://portal.mclinic.co.ke/api
- Admin Panel: https://portal.mclinic.co.ke/dashboard

**Default Admin Credentials:**
- Email: mettoalex@gmail.com
- Password: Digital2025

⚠️ **Remember to change the admin password after first login!**
