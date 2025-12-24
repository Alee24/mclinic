# User Data Migration Script

This script transforms user data from your old M-Clinic system to the new database schema.

## Quick Start

### Step 1: Prepare Your Data

Create a file named `old-users-data.sql` in the project root with your INSERT statement:

```sql
INSERT INTO `users` (`id`, `name`, `email`, `reg_code`, `password`, `mobile`, `address`, `location_id`, `status`, `profile_image`, `created_at`, `updated_at`, `is_suspended`, `suspended_by`) VALUES
(51, 'Daniel Sam Opiyo', 'd@gmail.com', '69DQ34', '$2a$10$...', '+254797166804', 'Nyamira Township', 3, 1, NULL, '2023-10-17 14:35:53', '2024-03-16 18:46:26', '1', 8),
(54, 'Nathan ', 'chebiialpha@gmail.com', 'Q9C368', '$2a$10$...', '0725 910243 ', 'Nairobi ', 3, 1, NULL, '2023-10-29 10:26:36', '2023-10-29 10:29:25', '0', NULL);
-- ... rest of your data
```

### Step 2: Run the Migration Script

```bash
node scripts/migrate-users.js
```

### Step 3: Import to Database

```bash
# Windows (PowerShell)
Get-Content transformed-users.sql | & "c:\xampp\mysql\bin\mysql.exe" -u root mclinic

# Linux/Mac
mysql -u root -p mclinic < transformed-users.sql
```

## What the Script Does

1. **Parses** your large INSERT statement
2. **Transforms** the data:
   - Splits `name` into `fname` and `lname`
   - Converts `is_suspended` to `status` (0 = suspended, 1 = active)
   - Removes unnecessary fields (`reg_code`, `location_id`, `suspended_by`)
   - Preserves passwords, emails, and other important data
3. **Generates** a new SQL file compatible with the new schema
4. **Validates** email addresses (skips records without email)

## Schema Transformation

### Old Schema → New Schema

| Old Field | New Field | Transformation |
|-----------|-----------|----------------|
| `name` | `fname` + `lname` | Split on first space |
| `email` | `email` | Direct copy |
| `password` | `password` | Direct copy |
| `mobile` | `mobile` | Direct copy |
| `address` | `address` | Direct copy |
| `status` + `is_suspended` | `status` | 0 if suspended, else original |
| `profile_image` | `profile_image` | Direct copy |
| `created_at` | `created_at` | Direct copy |
| `updated_at` | `updated_at` | Direct copy |
| `reg_code` | ❌ Removed | Not needed |
| `location_id` | ❌ Removed | Use city instead |
| `suspended_by` | ❌ Removed | Not needed |

## Output

The script generates `transformed-users.sql` with:
- Transformed INSERT statements
- Foreign key management
- Verification queries
- Import statistics

## Troubleshooting

### "Input file not found"
Create `old-users-data.sql` in the project root directory.

### "Failed to parse row X"
Check that row for:
- Unescaped quotes
- Missing commas
- Malformed data

### Duplicate email errors
The new system requires unique emails. Duplicates will be skipped during import.

## Example Output

```
🚀 M-Clinic User Data Migration
================================

📂 Reading: old-users-data.sql
📖 Parsing SQL INSERT statement...
✅ Found 622 user records
🔄 Transforming user records...
   Processed 100/622 records...
   Processed 200/622 records...
   ...
✅ Transformed 620 records (2 skipped)
💾 Writing: transformed-users.sql

✅ Migration Complete!
================================
📊 Statistics:
   - Total processed: 622
   - Successfully transformed: 620
   - Skipped: 2

📁 Output file: transformed-users.sql

🚀 Next steps:
   1. Review the transformed-users.sql file
   2. Run: mysql -u root mclinic < transformed-users.sql
   3. Verify the import in your database
```

## Verification

After import, verify the data:

```sql
-- Check total count
SELECT COUNT(*) FROM users;

-- View sample records
SELECT fname, lname, email, mobile, status FROM users LIMIT 10;

-- Check for duplicates
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING count > 1;
```

## Support

If you encounter issues:
1. Check the console output for specific errors
2. Review the generated SQL file
3. Verify your input data format matches the expected schema
