# 🚀 Data Migration Dashboard

## Overview
The Data Migration dashboard provides a user-friendly interface to import data from your old M-Clinic system into the new platform.

## Features

### ✨ What You Can Do:
- **Upload SQL Files**: Drag and drop or select SQL files from your old system
- **Preview Data**: See how your data will be transformed before importing
- **Multiple Data Types**: Support for Users, Doctors, Appointments, and Invoices
- **Real-time Progress**: Track migration progress with detailed statistics
- **Error Reporting**: Get detailed error messages for any failed records
- **Automatic Transformation**: Data is automatically converted to match the new schema

## How to Use

### Step 1: Access the Migration Dashboard
1. Log into your M-Clinic dashboard
2. Click on **"Data Migration"** in the sidebar (General section)

### Step 2: Select Data Type
Choose what type of data you're migrating:
- 👥 **Patients/Users** - Patient records and user accounts
- 👨‍⚕️ **Doctors** - Doctor profiles and credentials
- 📅 **Appointments** - Appointment history
- 💰 **Invoices** - Financial records

### Step 3: Upload SQL File
1. Click the upload area or drag and drop your `.sql` file
2. The file should contain an `INSERT INTO` statement from your old database

### Step 4: Preview
1. Click **"Preview Data"** to see how your data will be transformed
2. Review the first 10 records to ensure everything looks correct
3. Check the total record count

### Step 5: Execute Migration
1. If the preview looks good, click **"Execute Migration"**
2. Wait for the migration to complete
3. Review the statistics:
   - Total records processed
   - Successfully transformed
   - Skipped records
   - Any errors encountered

## Data Transformation

### Users/Patients
**Old Schema → New Schema:**
- `name` → Split into `fname` + `lname`
- `is_suspended` → Converted to `status` (0 = suspended, 1 = active)
- `reg_code` → Removed (not needed)
- `location_id` → Removed (use city instead)
- All other fields preserved

### Example SQL File Format

Your SQL file should look like this:

```sql
INSERT INTO `users` (`id`, `name`, `email`, `reg_code`, `password`, `mobile`, `address`, `location_id`, `status`, `profile_image`, `created_at`, `updated_at`, `is_suspended`, `suspended_by`) VALUES
(1, 'John Doe', 'john@example.com', 'ABC123', '$2a$10$...', '0712345678', 'Nairobi', 3, 1, NULL, '2023-01-01 00:00:00', '2023-01-01 00:00:00', '0', NULL),
(2, 'Jane Smith', 'jane@example.com', 'DEF456', '$2a$10$...', '0723456789', 'Mombasa', 6, 1, NULL, '2023-01-02 00:00:00', '2023-01-02 00:00:00', '0', NULL);
```

## Technical Details

### File Requirements
- **Format**: `.sql` file
- **Max Size**: 10MB
- **Content**: Valid SQL INSERT statement

### API Endpoints
- `POST /migration/preview` - Preview data transformation
- `POST /migration/execute` - Execute migration

### Error Handling
The system will:
- Skip records with missing required fields (e.g., email)
- Update existing records if email already exists
- Provide detailed error messages for debugging
- Continue processing even if some records fail

## Troubleshooting

### "Failed to process file"
- Ensure your SQL file is valid
- Check that the INSERT statement format matches the expected schema
- Verify the file is not corrupted

### "Migration failed"
- Review the error messages in the results panel
- Check database connectivity
- Ensure you have sufficient permissions

### Duplicate Email Errors
- The system will update existing records with the same email
- No duplicates will be created

### Missing Data
- Check the "Skipped" count in the results
- Review error messages to see which records were skipped and why

## Best Practices

1. **Always Preview First**: Never execute migration without previewing
2. **Backup Your Database**: Create a backup before large migrations
3. **Test with Small Batches**: Start with a small subset of data
4. **Review Errors**: Check all error messages before re-running
5. **Verify Results**: Check the dashboard to confirm data imported correctly

## Support

If you encounter issues:
1. Check the error messages in the migration results
2. Review the transformation logic in the preview
3. Verify your SQL file format
4. Contact support with the error details

## Security Notes

- Files are processed in memory and not stored permanently
- Only authenticated users can access the migration dashboard
- All password hashes are preserved during migration
- Data is validated before insertion

---

**Need Help?** Contact support or check the main documentation.
