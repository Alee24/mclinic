-- Fix for doctors table missing otp_expires
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP NULL;
-- Ensure users has it too just in case
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP NULL;
