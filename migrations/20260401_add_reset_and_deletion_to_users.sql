-- Add resetToken and account deletion status fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS resetToken VARCHAR(255) NULL AFTER verificationToken;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletionRequestedAt TIMESTAMP NULL DEFAULT NULL AFTER updatedAt;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletionScheduledAt TIMESTAMP NULL DEFAULT NULL AFTER deletionRequestedAt;
