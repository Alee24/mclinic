-- Migration: Add professional fields for medics
ALTER TABLE `users` ADD COLUMN `licenseNumber` VARCHAR(100) NULL AFTER `role`;
ALTER TABLE `users` ADD COLUMN `specialization` VARCHAR(255) NULL AFTER `licenseNumber`;
ALTER TABLE `users` ADD COLUMN `bio` TEXT NULL AFTER `specialization`;
ALTER TABLE `users` ADD COLUMN `isPublic` TINYINT(1) DEFAULT 0 AFTER `bio`;
