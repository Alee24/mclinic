-- Update existing or insert new ambulance packages
INSERT INTO `ambulance_packages` (`name`, `description`, `price`, `commission`, `validity_days`, `is_group_package`, `min_members`, `is_active`, `max_adults`, `max_children`)
VALUES 
('Individual Subscription', 'Full coverage for one person for one year.', 3000.00, 3000.00, 365, 0, 0, 1, 1, 0),
('Family Package', 'Coverage for parents and up to 4 children.', 6000.00, 6000.00, 365, 0, 0, 1, 2, 4),
('Parents Package', 'Specialized coverage for elderly parents.', 2500.00, 2500.00, 365, 0, 0, 1, 2, 0),
('Students Package', 'Coverage for students (min 150 students).', 800.00, 800.00, 365, 1, 150, 1, 0, 0),
('Corporate Package', 'Coverage for company members (min 150 members).', 700.00, 700.00, 365, 1, 150, 1, 0, 0),
('Instant Dispatch', 'Immediate one-off emergency ambulance dispatch.', 7000.00, 8000.00, 1, 0, 0, 1, 0, 0)
ON DUPLICATE KEY UPDATE 
`price` = VALUES(`price`),
`commission` = VALUES(`commission`),
`description` = VALUES(`description`),
`is_group_package` = VALUES(`is_group_package`),
`min_members` = VALUES(`min_members`);

-- Update system settings
UPDATE `system_setting` SET `value` = '7000' WHERE `key` = 'FEE_AMBULANCE_BASE';
