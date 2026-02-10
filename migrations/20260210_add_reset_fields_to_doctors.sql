-- Migration: Add Password Reset Fields to Doctors Table
ALTER TABLE doctors ADD COLUMN resetToken VARCHAR(100) NULL AFTER otpExpiry;
ALTER TABLE doctors ADD COLUMN resetTokenExpiry DATETIME NULL AFTER resetToken;
