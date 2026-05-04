-- M-Clinic Production Settings Hardening (M-Pesa & Email)
-- Run this on your production database (mclinicportal)

-- 1. M-Pesa Configuration
INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_ENV', 'production', 'Active M-Pesa Environment', 0)
ON DUPLICATE KEY UPDATE value = 'production';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_PROD_CONSUMER_KEY', 'fAXn4oBQdyFoxN0amp4SsP7wi1N8Cyew', 'M-Pesa Production Consumer Key', 1)
ON DUPLICATE KEY UPDATE value = 'fAXn4oBQdyFoxN0amp4SsP7wi1N8Cyew';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_PROD_CONSUMER_SECRET', 'ijbw3rFdhG8GLFcJ', 'M-Pesa Production Consumer Secret', 1)
ON DUPLICATE KEY UPDATE value = 'ijbw3rFdhG8GLFcJ';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_PROD_SHORTCODE', '300977', 'M-Pesa Production Shortcode', 0)
ON DUPLICATE KEY UPDATE value = '300977';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_PROD_PASSKEY', 'd6f8d245cf3fc6fec0ec4c2182980e1243936cb21706ebce9b036cc579cba879', 'M-Pesa Production Passkey', 1)
ON DUPLICATE KEY UPDATE value = 'd6f8d245cf3fc6fec0ec4c2182980e1243936cb21706ebce9b036cc579cba879';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_PROD_CALLBACK_URL', 'https://portal.mclinic.co.ke/api/mpesa/callback', 'M-Pesa Production Callback URL', 0)
ON DUPLICATE KEY UPDATE value = 'https://portal.mclinic.co.ke/api/mpesa/callback';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('PAYMENT_MPESA_ENABLED', 'true', 'Enable M-Pesa payments', 0)
ON DUPLICATE KEY UPDATE value = 'true';

-- 2. SMTP Email Configuration
INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('EMAIL_SMTP_HOST', 'mail.mclinic.co.ke', 'SMTP Host', 0)
ON DUPLICATE KEY UPDATE value = 'mail.mclinic.co.ke';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('EMAIL_SMTP_PORT', '465', 'SMTP Port', 0)
ON DUPLICATE KEY UPDATE value = '465';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('EMAIL_SMTP_USER', 'info@mclinic.co.ke', 'SMTP Username', 0)
ON DUPLICATE KEY UPDATE value = 'info@mclinic.co.ke';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('EMAIL_SMTP_PASS', 'Digital2025', 'SMTP Password', 1)
ON DUPLICATE KEY UPDATE value = 'Digital2025';

INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('EMAIL_SMTP_SECURE', 'true', 'Use SSL', 0)
ON DUPLICATE KEY UPDATE value = 'true';

-- Enable Email Notifications
INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('EMAIL_NOTIFICATIONS_ENABLED', 'true', 'Master toggle for email notifications', 0)
ON DUPLICATE KEY UPDATE value = 'true';
