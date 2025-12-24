-- Transformed Users Data for New M-Clinic System
-- Generated: 2025-12-24T17:32:57.269Z
-- Total Records: 1

USE mclinic;

-- Disable foreign key checks for faster import
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `users` (`email`, `password`, `mobile`, `address`, `status`, `created_at`, `updated_at`, `fname`, `lname`, `profile_image`)
VALUES
('d@gmail.com', '$2a$10$4zagaVWGbiyoQMHgANcsIuXCk3AecUpFyIzR88Lxazshq91pIeMdW', '+254797166804', 'Nyamira Township, Nyamira town', 0, '2023-10-17 14:35:53', '2024-03-16 18:46:26', 'Daniel', 'Sam Opiyo', NULL);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify import
SELECT COUNT(*) AS 'Total Users Imported' FROM users;
SELECT 'Import completed successfully!' AS Status;
