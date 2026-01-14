-- Add missing resetToken and resetTokenExpiry columns to users table
-- This fixes the "Unknown column 'User.resetToken' in 'field list'" error

ALTER TABLE `users` 
ADD COLUMN `resetToken` VARCHAR(255) NULL AFTER `createdAt`,
ADD COLUMN `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`;

-- Verify the columns were added
DESCRIBE `users`;
