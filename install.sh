#!/bin/bash

# MClinic Kenya - Full Server Installation Script (Live Production)
# This script installs Node.js, MySQL, PM2 and sets up the MClinic CRM.

# --- Configuration ---
API_PORT=3434
WEB_PORT=3000
DB_NAME="mclinic"
DB_USER="root"
DB_PASS="Digital2025" # Update this to your desired root password

# --- Colors ---
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Starting MClinic Installation...${NC}"

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20)
echo -e "${GREEN}>>> Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install MySQL Server
echo -e "${GREEN}>>> Installing MySQL...${NC}"
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. Configure MySQL (Non-interactive)
echo -e "${GREEN}>>> Configuring Database...${NC}"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';"
sudo mysql -u root -p${DB_PASS} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
sudo mysql -u root -p${DB_PASS} -e "FLUSH PRIVILEGES;"

# 5. Install Process Manager (PM2)
sudo npm install -g pm2

# 6. Install Project Dependencies
echo -e "${GREEN}>>> Installing Project Dependencies...${NC}"
npm install

# 7. Configure Backend Environment
echo -e "${GREEN}>>> Setting up Backend .env...${NC}"
cat <<EOT > apps/api/.env
PORT=${API_PORT}
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=MCL_SECURE_RANDOM_KEY_2025
EOT

# 8. Configure Frontend Environment
echo -e "${GREEN}>>> Setting up Frontend .env...${NC}"
cat <<EOT > apps/web/.env
PORT=${WEB_PORT}
NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
EOT

# 9. Build and Seed
echo -e "${GREEN}>>> Building Application...${NC}"
npm run build

echo -e "${GREEN}>>> Seeding Initial Admin Data...${NC}"
# We assume the server is running or we use a CLI command if available. 
# Alternatively, start the API briefly to run seeding via curl.
pm2 start "npm run dev" --name "temp-api" --cwd "apps/api"
sleep 15
curl -X POST http://localhost:${API_PORT}/seeding/settings
curl -X POST http://localhost:${API_PORT}/seeding/run
pm2 delete temp-api

# 10. Start Production Processes
echo -e "${GREEN}>>> Starting Application with PM2...${NC}"

# Backend
pm2 start "npm run start" --name "mclinic-api" --cwd "apps/api"

# Frontend
pm2 start "npm run start" --name "mclinic-web" --cwd "apps/web"

pm2 save
pm2 startup

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "API is running on: http://localhost:${API_PORT}"
echo -e "Frontend is running on: http://localhost:${WEB_PORT}"
echo -e "Admin Account: mettoalex@gmail.com"
echo -e "Admin Password: Digital2025"
echo -e "${GREEN}========================================${NC}"
