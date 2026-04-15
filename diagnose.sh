#!/bin/bash
# ============================================
# MClinic VPS Diagnostic Script
# Run: bash /var/www/mclinicportal/diagnose.sh
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   MClinic VPS Diagnostic Report        ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# --- 1. Check PM2 Processes ---
echo -e "${YELLOW}[1/5] PM2 Process Status${NC}"
pm2 list 2>/dev/null || echo -e "${RED}PM2 not found or no processes${NC}"
echo ""

# --- 2. Check API Logs (last 30 lines) ---
echo -e "${YELLOW}[2/5] Last 30 lines of API logs${NC}"
pm2 logs mclinic-api --lines 30 --nostream 2>/dev/null || echo -e "${RED}Could not read API logs${NC}"
echo ""

# --- 3. Check Database Connection ---
echo -e "${YELLOW}[3/5] Database Connection Test${NC}"
DB_USER="m-cl-app"
DB_PASS="Mclinic@App2023?"
DB_NAME="mclinicportal"

mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 'DB Connected OK' AS status, COUNT(*) as user_count FROM users;" 2>/dev/null \
  && echo -e "${GREEN}✅ Database is reachable${NC}" \
  || echo -e "${RED}❌ Database connection FAILED${NC}"

# Check last_access column exists
echo ""
echo -e "${YELLOW}  Checking last_access column:${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM users LIKE 'last_access';" 2>/dev/null \
  && echo -e "${GREEN}  ✅ last_access column exists${NC}" \
  || echo -e "${RED}  ❌ last_access column MISSING${NC}"
echo ""

# --- 4. Check API HTTP Response ---
echo -e "${YELLOW}[4/5] API Health Check (HTTP)${NC}"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5454/auth/health 2>/dev/null)
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "404" ]; then
  echo -e "${GREEN}✅ API is responding (HTTP $API_RESPONSE)${NC}"
else
  echo -e "${RED}❌ API not responding (HTTP $API_RESPONSE)${NC}"
  echo "Trying port 7899..."
  API_RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7899/ 2>/dev/null)
  echo "Port 7899 response: HTTP $API_RESPONSE2"
fi
echo ""

# --- 5. Add missing column if needed ---
echo -e "${YELLOW}[5/5] Auto-fix: Ensure last_access column exists${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
  SELECT COUNT(*) INTO @col_exists 
  FROM information_schema.columns 
  WHERE table_schema='$DB_NAME' AND table_name='users' AND column_name='last_access';
  
  SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN last_access TIMESTAMP NULL DEFAULT NULL',
    'SELECT ''Column already exists'' AS result'
  );
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
" 2>/dev/null && echo -e "${GREEN}✅ last_access column is ready${NC}" || echo -e "${RED}❌ Could not create column - check DB permissions${NC}"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   Diagnostic Complete                  ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "📋 Quick Fix Commands:"
echo "  Restart API:  pm2 restart mclinic-api"
echo "  Restart All:  pm2 restart all"
echo "  Full Update:  bash /var/www/mclinicportal/update.sh"
echo ""
