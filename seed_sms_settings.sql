INSERT INTO system_setting (`key`, `value`, `description`, `isSecure`) VALUES 
('sms_api_key', '', 'API Key for the SMS provider (Advanta SMS)', 1),
('sms_partner_id', '', 'Partner ID for the SMS provider', 0),
('sms_shortcode', '', 'Sender ID / Shortcode for the SMS provider', 0)
ON DUPLICATE KEY UPDATE description=VALUES(description);
