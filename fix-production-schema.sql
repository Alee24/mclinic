-- Fix M-Clinic Production Database Schema
-- Adds missing columns to align with TypeORM entities

USE mclinicportal;

SELECT 'Starting schema migration...' AS Status;

-- Add role column (enum) if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mclinicportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `role` ENUM(''patient'', ''doctor'', ''admin'', ''lab_tech'', ''nurse'', ''clinician'', ''medic'', ''finance'', ''pharmacist'') NOT NULL DEFAULT ''patient'' AFTER `password`',
    'SELECT ''role column already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add emailVerifiedAt column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mclinicportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'emailVerifiedAt');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `emailVerifiedAt` TIMESTAMP NULL AFTER `status`',
    'SELECT ''emailVerifiedAt column already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add national_id column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mclinicportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'national_id');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `national_id` VARCHAR(255) NULL AFTER `mobile`',
    'SELECT ''national_id column already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add resetToken column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mclinicportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'resetToken');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `resetToken` VARCHAR(255) NULL AFTER `updated_at`',
    'SELECT ''resetToken column already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add resetTokenExpiry column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mclinicportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'resetTokenExpiry');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`',
    'SELECT ''resetTokenExpiry column already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show final structure
SELECT '✅ Migration complete! Final users table structure:' AS Status;
DESCRIBE `users`;

SELECT 'Checking for existing users...' AS Status;
SELECT COUNT(*) AS total_users FROM `users`;
