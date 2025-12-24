USE mclinic;

-- First, create user accounts for doctors
INSERT IGNORE INTO user (email, password, role, fname, lname, mobile, status, createdAt, updatedAt) VALUES
('benedictkoech@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Benedict', 'Koech', '0705227980', 1, NOW(), NOW()),
('smuhanda588@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Sharon', 'Muhanda', '0792236249', 1, NOW(), NOW()),
('kmunyao22@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Kelvin', 'Ndambuki', '0729739072', 1, NOW(), NOW()),
('jackiewanja@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Jackline', 'Wanja', '0722247769', 1, NOW(), NOW()),
('olivialesly@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Olivia', 'Ochieng', '0700887780', 1, NOW(), NOW());

-- Now create doctor records
INSERT INTO doctors (user_id, fname, lname, national_id, mobile, dr_type, status, latitude, longitude, createdAt, updatedAt)
SELECT 
    u.id,
    u.fname,
    u.lname,
    CASE u.email
        WHEN 'benedictkoech@gmail.com' THEN '30882221'
        WHEN 'smuhanda588@gmail.com' THEN '33854832'
        WHEN 'kmunyao22@gmail.com' THEN '28148147'
        WHEN 'jackiewanja@gmail.com' THEN '13361878'
        WHEN 'olivialesly@gmail.com' THEN '31626064'
    END,
    u.mobile,
    CASE u.email
        WHEN 'benedictkoech@gmail.com' THEN 'Nurse'
        WHEN 'smuhanda588@gmail.com' THEN 'Nurse'
        WHEN 'kmunyao22@gmail.com' THEN 'Clinical Officer'
        WHEN 'jackiewanja@gmail.com' THEN 'Nurse'
        WHEN 'olivialesly@gmail.com' THEN 'Nurse'
    END,
    'active',
    CASE u.email
        WHEN 'benedictkoech@gmail.com' THEN -1.315315
        WHEN 'smuhanda588@gmail.com' THEN -1.225225
        WHEN 'kmunyao22@gmail.com' THEN -1.297297
        WHEN 'jackiewanja@gmail.com' THEN -1.369369
        WHEN 'olivialesly@gmail.com' THEN -0.414414
    END,
    CASE u.email
        WHEN 'benedictkoech@gmail.com' THEN 36.784467
        WHEN 'smuhanda588@gmail.com' THEN 36.855273
        WHEN 'kmunyao22@gmail.com' THEN 36.802226
        WHEN 'jackiewanja@gmail.com' THEN 36.965512
        WHEN 'olivialesly@gmail.com' THEN 34.199093
    END,
    NOW(),
    NOW()
FROM user u
WHERE u.role = 'doctor' 
AND u.email IN ('benedictkoech@gmail.com', 'smuhanda588@gmail.com', 'kmunyao22@gmail.com', 'jackiewanja@gmail.com', 'olivialesly@gmail.com')
AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = u.id);

SELECT 'Doctors loaded successfully!' AS Status;
SELECT COUNT(*) AS 'Total Doctor Users' FROM user WHERE role = 'doctor';
SELECT COUNT(*) AS 'Total Doctor Records' FROM doctors;
