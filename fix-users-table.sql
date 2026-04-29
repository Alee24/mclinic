-- Fix missing columns in users table to match User entity
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `licenseNumber` VARCHAR(255) NULL AFTER `role`,
ADD COLUMN IF NOT EXISTS `specialization` VARCHAR(255) NULL AFTER `licenseNumber`,
ADD COLUMN IF NOT EXISTS `bio` TEXT NULL AFTER `specialization`,
ADD COLUMN IF NOT EXISTS `isPublic` TINYINT(1) NOT NULL DEFAULT 0 AFTER `bio`,
ADD COLUMN IF NOT EXISTS `lastAccess` TIMESTAMP NULL AFTER `updatedAt`;

-- Also ensure resetToken columns exist (redundancy check)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `resetToken` VARCHAR(255) NULL AFTER `createdAt`,
ADD COLUMN IF NOT EXISTS `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`;
