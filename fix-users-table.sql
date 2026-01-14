-- Direct SQL to add missing columns to users table
-- Run this with: mysql -u m-cl-app -p'Mclinic@App2023?' mclinicportal < fix-users-table.sql

USE mclinicportal;

-- Add role column
ALTER TABLE `users` ADD COLUMN `role` ENUM('patient', 'doctor', 'admin', 'lab_tech', 'nurse', 'clinician', 'medic', 'finance', 'pharmacist') NOT NULL DEFAULT 'patient' AFTER `password`;

-- Add emailVerifiedAt column  
ALTER TABLE `users` ADD COLUMN `emailVerifiedAt` TIMESTAMP NULL AFTER `status`;

-- Add national_id column
ALTER TABLE `users` ADD COLUMN `national_id` VARCHAR(255) NULL AFTER `mobile`;

-- Add resetToken column
ALTER TABLE `users` ADD COLUMN `resetToken` VARCHAR(255) NULL AFTER `updated_at`;

-- Add resetTokenExpiry column
ALTER TABLE `users` ADD COLUMN `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`;

SELECT '✅ All columns added successfully!' AS Status;
SELECT 'Final users table structure:' AS Info;
DESCRIBE `users`;
