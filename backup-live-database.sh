#!/bin/bash
# ============================================================================
# BACKUP LIVE DATABASE BEFORE CLEARING ACTIVITY DATA
# ============================================================================

# Database connection details (UPDATE THESE FOR YOUR LIVE SERVER)
DB_HOST="your-live-server-host"
DB_USER="your-db-username"
DB_PASS="your-db-password"
DB_NAME="mclinicportal"

# Backup file name with timestamp
BACKUP_FILE="mclinic_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "🔄 Creating backup of live database..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Create backup using mysqldump
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    echo "File size: $(du -h $BACKUP_FILE | cut -f1)"
    echo ""
    echo "⚠️  IMPORTANT: Download this backup file to a safe location before proceeding!"
else
    echo "❌ Backup failed!"
    exit 1
fi
