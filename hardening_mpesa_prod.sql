-- M-Pesa Production Credentials Hardening
-- Run this on your production database (mclinicportal)

-- Ensure MPESA_ENV is set to production
INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('MPESA_ENV', 'production', 'Active M-Pesa Environment', 0)
ON DUPLICATE KEY UPDATE value = 'production';

-- Set Production Credentials
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

-- Enable M-Pesa
INSERT INTO system_setting (`key`, value, description, isSecure) 
VALUES ('PAYMENT_MPESA_ENABLED', 'true', 'Enable M-Pesa payments', 0)
ON DUPLICATE KEY UPDATE value = 'true';
