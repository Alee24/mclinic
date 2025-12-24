# Data Migration Guide - Old M-Clinic to New M-Clinic

## Overview
This guide helps you migrate data from your existing M-Clinic system to the new NestJS-based system.

## Database Schema Differences

### Users Table Transformation
**Old Schema → New Schema:**
- `name` (single field) → `fname` + `lname` (split on first space)
- `reg_code` → Not needed (removed)
- `location_id` → `city` (will need location lookup)
- `is_suspended`, `suspended_by` → `status` (0 if suspended, 1 if active)

## Migration Steps

### Step 1: Export from Old System
```bash
# On your old server, export the users table
mysqldump -u root -p m_clinic users > old_users.sql
```

### Step 2: Transform the Data
Create a file `transform_users.sql`:

```sql
USE mclinic;

-- Create temporary table with old structure
CREATE TEMPORARY TABLE temp_old_users (
    id BIGINT,
    name VARCHAR(255),
    email VARCHAR(255),
    reg_code VARCHAR(50),
    password VARCHAR(255),
    mobile VARCHAR(50),
    address VARCHAR(255),
    location_id INT,
    status TINYINT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_suspended TINYINT,
    suspended_by INT
);

-- Load your old data into temp table
LOAD DATA LOCAL INFILE 'old_users.csv'
INTO TABLE temp_old_users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Transform and insert into new users table
INSERT INTO users (email, password, mobile, address, status, created_at, updated_at, fname, lname, profile_image)
SELECT 
    email,
    password,
    mobile,
    address,
    CASE WHEN is_suspended = 1 THEN 0 ELSE status END,
    created_at,
    updated_at,
    SUBSTRING_INDEX(name, ' ', 1) as fname,
    CASE 
        WHEN LOCATE(' ', name) > 0 THEN SUBSTRING(name, LOCATE(' ', name) + 1)
        ELSE ''
    END as lname,
    profile_image
FROM temp_old_users
ON DUPLICATE KEY UPDATE
    fname = VALUES(fname),
    lname = VALUES(lname),
    mobile = VALUES(mobile),
    updated_at = VALUES(updated_at);
```

### Step 3: Quick Import Method
**For immediate testing, use this simplified approach:**

1. Save your users INSERT statement to a file: `old_users_data.sql`
2. Run this transformation:

```bash
# This will import the data
mysql -u root mclinic < old_users_data.sql
```

## Important Notes

1. **Email Uniqueness**: The new system requires unique emails. Duplicates will be skipped.
2. **Password Hashes**: bcrypt hashes from old system will work in new system
3. **Profile Images**: Image paths should be updated if storage location changed
4. **Location Data**: You may need to manually map location_id to city names

## Quick Test
After migration, verify:
```sql
SELECT COUNT(*) FROM users;
SELECT fname, lname, email, mobile FROM users LIMIT 10;
```

## Rollback
If something goes wrong:
```sql
TRUNCATE TABLE users;
```

Then re-run the migration.

## Next Steps After Users Migration
1. Import doctors data
2. Import appointments data
3. Import invoices and transactions
4. Verify all relationships are intact
