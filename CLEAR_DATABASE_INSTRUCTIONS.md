# How to Clear Activity Data from Live Database

## ⚠️ CRITICAL: Read This First

This process will **permanently delete** all transactional data from your live database. Make sure you have a complete backup before proceeding.

## Step 1: Create a Backup

### Option A: Using the provided batch script (Windows)

1. Edit `backup-live-database.bat` and update these values:
   ```batch
   SET DB_HOST=your-live-server-ip
   SET DB_USER=your-db-username
   SET DB_PASS=your-db-password
   ```

2. Run the script:
   ```bash
   backup-live-database.bat
   ```

### Option B: Manual backup via SSH

```bash
# SSH into your VPS
ssh user@your-server-ip

# Create backup
mysqldump -u root -p mclinicportal > mclinic_backup_$(date +%Y%m%d_%H%M%S).sql

# Download the backup to your local machine
# (Run this from your local machine)
scp user@your-server-ip:/path/to/backup.sql ./
```

## Step 2: Execute the Clearing Script

### Option A: Via MySQL command line

```bash
# SSH into your VPS
ssh user@your-server-ip

# Upload the script
# (From your local machine)
scp clear-activity-data.sql user@your-server-ip:~/

# Execute the script
mysql -u root -p mclinicportal < clear-activity-data.sql
```

### Option B: Via phpMyAdmin

1. Access phpMyAdmin on your server
2. Select the `mclinicportal` database
3. Go to the "SQL" tab
4. Copy and paste the contents of `clear-activity-data.sql`
5. Click "Go"

## Step 3: Verify the Results

After running the script, it will display a verification table showing:
- ✅ User accounts preserved (should show count > 0)
- ✅ Doctor/patient profiles preserved
- ✅ All activity tables cleared (should show count = 0)

## What Gets Deleted

- ❌ All appointments
- ❌ All medical records
- ❌ All prescriptions
- ❌ All lab orders and results
- ❌ All pharmacy orders
- ❌ All invoices and transactions
- ❌ All reviews
- ❌ All ambulance subscriptions

## What Gets Preserved

- ✅ All user accounts (admin, patients, doctors, staff)
- ✅ Patient profiles and medical information
- ✅ Doctor profiles, licenses, and schedules
- ✅ Wallet structure (balances can be manually reset)
- ✅ All reference data (services, medications, departments, locations, etc.)

## Optional: Reset Wallet Balances

If you want to reset all wallet and doctor balances to zero, uncomment these lines in the script:

```sql
UPDATE `wallets` SET `balance` = 0.00;
UPDATE `doctors` SET `balance` = 0.00;
```

## Rollback (If Needed)

If something goes wrong, you can restore from your backup:

```bash
# SSH into your VPS
ssh user@your-server-ip

# Upload your backup
scp mclinic_backup_TIMESTAMP.sql user@your-server-ip:~/

# Restore the database
mysql -u root -p mclinicportal < mclinic_backup_TIMESTAMP.sql
```

## Need Help?

If you need assistance executing this on your live server, let me know and I can guide you through each step.
