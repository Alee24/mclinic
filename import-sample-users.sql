-- Import Users/Patients Data from Existing System
-- This script transforms the old users table data to match the new schema

USE mclinic;

-- First, let's create a temporary mapping for the data transformation
-- We'll split the 'name' field into 'fname' and 'lname'

INSERT INTO `users` (`email`, `password`, `mobile`, `address`, `status`, `created_at`, `updated_at`, `fname`, `lname`, `profile_image`)
SELECT 
    email,
    password,
    mobile,
    address,
    CASE WHEN is_suspended = '1' THEN 0 ELSE status END as status,
    created_at,
    updated_at,
    -- Split name into first and last name
    SUBSTRING_INDEX(name, ' ', 1) as fname,
    CASE 
        WHEN LOCATE(' ', name) > 0 THEN SUBSTRING(name, LOCATE(' ', name) + 1)
        ELSE ''
    END as lname,
    profile_image
FROM (
    SELECT 'd@gmail.com' as email, '$2a$10$4zagaVWGbiyoQMHgANcsIuXCk3AecUpFyIzR88Lxazshq91pIeMdW' as password, '+254797166804' as mobile, 'Nyamira Township, Nyamira town' as address, 1 as status, '2023-10-17 14:35:53' as created_at, '2024-03-16 18:46:26' as updated_at, 'Daniel Sam Opiyo' as name, NULL as profile_image, '1' as is_suspended
    UNION ALL SELECT 'chebiialpha@gmail.com', '$2a$10$mb7lxJC1PFRMoIslOGk3uehE7mxXOsoUQtyhjgjAHZ1MuUv9ewA3m', '0725 910243 ', 'Nairobi ', 1, '2023-10-29 10:26:36', '2023-10-29 10:29:25', 'Nathan ', NULL, '0'
    UNION ALL SELECT 'vlando@outlook.com', '$2a$10$voOs4QLiDNTlSsCzoWrhveC.ODZmcxqisr3Fa19I.MVaSjGzwrv1m', '0711627575', '12345', 1, '2023-11-02 16:23:30', '2025-04-20 14:01:03', 'Victor Lando ', '1745157663885-FhZWiAAAAAAAAAA.jpg', '0'
    UNION ALL SELECT 'wambuimwangi.wambui@gmail.com', '$2a$10$qHiC/ST5VFXuPRZKz7TXl.A/R1FPMUrq2YXqna0IH6sqCMSb9CHei', '0708728957', 'Nairobi', 1, '2023-11-04 17:59:36', '2023-11-04 18:02:17', 'Michelle', NULL, '0'
    UNION ALL SELECT 'mettoa@gmail.com', '$2a$10$MjT/xtrj5NpqTy6fVcG7vOvNLXoq1MWEZk/Pee55Uj73KDF.CyURS', NULL, 'Langata Sunvalley 2', 1, '2023-11-04 18:20:00', '2024-05-14 19:16:35', 'Alex kimetto bore', NULL, '1'
    UNION ALL SELECT 'leahmbuya54@gmail.com', '$2a$10$0Atxt578bQ3gSChVPM0yO.gULCYk6wGcs42LGwsGFIg73LsJGDtJK', '0720740882', '21', 1, '2023-12-12 17:50:16', '2025-05-13 17:55:37', 'Leah Mbuya', '1747158937913-FhZWiAH4AABAAEA.jpg', '1'
    UNION ALL SELECT 'mettoalex@gmail.com', '$2a$10$1k6AoG3c/VG/a1d0QWR7nubb73Y7cT5t1pyfK5Lz2zCeiKQNnY1KW', '071234567', 'Langata ', 1, '2024-05-20 17:05:35', '2025-06-10 10:06:54', 'M-Clinic', '1749496267150-FhZWiAH4AABAAEA.jpg', '0'
    UNION ALL SELECT 'nafulabunyasi841@gmail.com', '$2a$10$9q/xOKb4qsJOrkE.fUpK6e44/0mx5ZpjNuyxHVkSfNfeZULaxVpiW', '0700 448448 ', '513-00100', 1, '2024-07-27 05:41:07', '2025-11-20 10:02:27', 'Naomi Bunyasi', '1745212956125-FhZWiAH4AABAAEA.jpg', '0'
    UNION ALL SELECT 'bboazjohn@gmail.com', '$2a$10$XWFoVrj2VH2fKT7J2o/AvORmsQIonQK3miZj9okfFcmREnMYiyXWC', '0717438053', 'Nyayo Highrise estate', 1, '2024-07-18 14:31:23', '2024-07-18 14:33:54', 'Boaz John', NULL, '0'
    UNION ALL SELECT 'lyonsmasawa@gmail.com', '$2a$10$qXACrUlkMzm4tiRMW3xV4u0G8vdOx/DNRB52nPczNsSdBb.OXdjeu', '0708957380', 'Rongai ', 1, '2024-12-20 12:53:28', '2025-05-09 20:03:29', 'Lyons Masawaa', '1746819650665-FhZWiAAAAAAAAAA.jpg', '0'
) as temp_users
ON DUPLICATE KEY UPDATE
    fname = VALUES(fname),
    lname = VALUES(lname),
    mobile = VALUES(mobile),
    address = VALUES(address),
    status = VALUES(status),
    updated_at = VALUES(updated_at);

SELECT 'Sample users imported successfully!' AS Status;
SELECT COUNT(*) AS 'Total Users' FROM users;
