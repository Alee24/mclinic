-- Fix M-Clinic Production Database Schema
-- Adds missing columns to align with TypeORM entities

USE mclinicportal;

-- First, check if users table exists, if not show error
SELECT 'Checking users table...' AS Status;

-- Add missing columns to users table
-- Add role column (enum)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `role` ENUM('patient', 'doctor', 'admin', 'lab_tech', 'nurse', 'clinician', 'medic', 'finance', 'pharmacist') NOT NULL DEFAULT 'patient' AFTER `password`;

-- Add emailVerifiedAt column
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `emailVerifiedAt` TIMESTAMP NULL AFTER `status`;

-- Add national_id column (encrypted)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `national_id` VARCHAR(255) NULL AFTER `mobile`;

-- Add resetToken and resetTokenExpiry columns
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `resetToken` VARCHAR(255) NULL AFTER `createdAt`,
ADD COLUMN IF NOT EXISTS `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`;

-- Rename created_at to createdAt and updated_at to updatedAt for consistency
-- (Only if they don't already exist with the new names)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mclinicportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'createdAt');

SELECT IF(@col_exists = 0, 
    'Will rename created_at to createdAt', 
    'createdAt column already exists') AS Status;

-- Show final structure
SELECT 'Migration complete! Final users table structure:' AS Status;
DESCRIBE `users`;

SELECT 'Checking for existing users...' AS Status;
SELECT COUNT(*) AS total_users FROM `users`;
