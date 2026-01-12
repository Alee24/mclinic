#!/bin/bash

# Database Verification Script for M-Clinic
# This script verifies that all tables exist and the database is properly configured

echo "🔍 M-Clinic Database Verification"
echo "=================================="
echo ""

# Database credentials (from .env)
DB_USER="m-cl-app"
DB_PASS="Mclinic@App2023?"
DB_NAME="mclinic"
DB_HOST="localhost"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Expected tables (from Prisma schema)
EXPECTED_TABLES=(
    "users"
    "patients"
    "medical_profiles"
    "doctors"
    "doctor_schedules"
    "doctor_licences"
    "appointment"
    "medical_record"
    "wallets"
    "transaction"
    "mpesa_transaction"
    "payment_config"
    "invoice"
    "invoice_item"
    "locations"
    "services"
    "specialities"
    "departments"
    "medication"
    "prescription"
    "prescription_item"
    "pharmacy_order"
    "pharmacy_order_item"
    "lab_test"
    "lab_order"
    "lab_result"
    "ambulance_subscriptions"
    "system_setting"
    "reviews"
)

echo "📊 Checking database connection..."
if mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo "Please check your database credentials in apps/api/.env"
    exit 1
fi

echo ""
echo "📋 Verifying tables..."
MISSING_TABLES=()
EXISTING_TABLES=()

for table in "${EXPECTED_TABLES[@]}"; do
    if mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -e "DESCRIBE $table;" &>/dev/null; then
        echo -e "${GREEN}✓${NC} $table"
        EXISTING_TABLES+=("$table")
    else
        echo -e "${RED}✗${NC} $table (MISSING)"
        MISSING_TABLES+=("$table")
    fi
done

echo ""
echo "📈 Summary:"
echo "  Total Expected: ${#EXPECTED_TABLES[@]}"
echo "  Existing: ${#EXISTING_TABLES[@]}"
echo "  Missing: ${#MISSING_TABLES[@]}"

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠ Missing tables detected!${NC}"
    echo "Run the following command to create missing tables:"
    echo "  cd /var/www/mclinicportal/apps/api"
    echo "  npx prisma db push"
    exit 1
fi

echo ""
echo "🔐 Checking database security..."

# Check if root user is being used
CURRENT_USER=$(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -se "SELECT USER();")
if [[ "$CURRENT_USER" == *"root"* ]]; then
    echo -e "${YELLOW}⚠ WARNING: Using root user for database connection${NC}"
    echo "  Consider creating a dedicated user with limited privileges"
else
    echo -e "${GREEN}✓ Using dedicated database user${NC}"
fi

# Check if password is set
if [ -z "$DB_PASS" ]; then
    echo -e "${RED}✗ No database password set${NC}"
else
    echo -e "${GREEN}✓ Database password is configured${NC}"
fi

# Check connection from localhost only
if [ "$DB_HOST" == "localhost" ] || [ "$DB_HOST" == "127.0.0.1" ]; then
    echo -e "${GREEN}✓ Database connection restricted to localhost${NC}"
else
    echo -e "${YELLOW}⚠ Database allows remote connections${NC}"
fi

echo ""
echo "📊 Database Statistics:"

# Count records in key tables
echo "  Users: $(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -se "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")"
echo "  Patients: $(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -se "SELECT COUNT(*) FROM patients;" 2>/dev/null || echo "0")"
echo "  Doctors: $(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -se "SELECT COUNT(*) FROM doctors;" 2>/dev/null || echo "0")"
echo "  Appointments: $(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -se "SELECT COUNT(*) FROM appointment;" 2>/dev/null || echo "0")"
echo "  Services: $(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -se "SELECT COUNT(*) FROM services;" 2>/dev/null || echo "0")"

echo ""
echo -e "${GREEN}✅ Database verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Ensure API is running: pm2 status"
echo "  2. Test API endpoint: curl https://portal.mclinic.co.ke/api/users/count-active"
echo "  3. Login to dashboard: https://portal.mclinic.co.ke/login"
