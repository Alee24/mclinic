USE mclinic;

-- Create user accounts for more doctors
INSERT IGNORE INTO user (email, password, role, fname, lname, mobile, status, createdAt, updatedAt) VALUES
('nyakanarose91@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Rose', 'Nyakana', '0729223943', 1, NOW(), NOW()),
('janemwikamba@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Jane', 'Mwikamba', '0725057082', 1, NOW(), NOW()),
('lizzmwikah@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Elizabeth', 'Mwikali', '0728766884', 1, NOW(), NOW()),
('hellensey3@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Phoebe', 'Ogalloh', '0724144930', 1, NOW(), NOW()),
('macklynengao@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Macklyne', 'Ngao', '0712485867', 1, NOW(), NOW()),
('oyahmic@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Michael', 'Oyah', '0722746788', 1, NOW(), NOW()),
('oduorcecelia@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Cecelia', 'Oduor', '0791941857', 1, NOW(), NOW()),
('kavitamwima@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Mary', 'Kavita', '0705735005', 1, NOW(), NOW()),
('munyanya1978@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Roseanne', 'Anguche', '0733497044', 1, NOW(), NOW()),
('bettysang2@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Betty', 'Sang', '0724265018', 1, NOW(), NOW()),
('leahmbuya54@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Leah', 'Wacuka', '0720740882', 1, NOW(), NOW()),
('alfredmacharia84@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Alfred', 'Macharia', '0725062140', 1, NOW(), NOW()),
('damianaoduor@mtrh.go.ke', '$2b$10$hashedpassword', 'doctor', 'Damiana', 'Atieno', '0726658820', 1, NOW(), NOW()),
('amkiprop@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Aden', 'Kiprop', '0725898035', 1, NOW(), NOW()),
('alexanderlokrole@mtrh.go.ke', '$2b$10$hashedpassword', 'doctor', 'Alexander', 'Lokrole', '0722413450', 1, NOW(), NOW()),
('jackline.amakobbe@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Jackline', 'Amakobe', '0726046693', 1, NOW(), NOW()),
('jackmbaka09@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Jack', 'Mbaka', '0722846845', 1, NOW(), NOW()),
('carolnyagu123@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Carol', 'Gicheru', '0723126620', 1, NOW(), NOW()),
('nyosenya@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Daniel', 'Awuonda', '0721594124', 1, NOW(), NOW()),
('carolinekemunto@gmail.com', '$2b$10$hashedpassword', 'doctor', 'Caroline', 'Kemunto', '0725461212', 1, NOW(), NOW());

-- Insert doctor records for all new users
INSERT INTO doctors (user_id, fname, lname, national_id, mobile, sex, dr_type, status, latitude, longitude, createdAt, updatedAt)
SELECT 
    u.id,
    u.fname,
    u.lname,
    CASE u.email
        WHEN 'nyakanarose91@gmail.com' THEN '28103362'
        WHEN 'janemwikamba@gmail.com' THEN '27964845'
        WHEN 'lizzmwikah@gmail.com' THEN '21874093'
        WHEN 'hellensey3@gmail.com' THEN '24426451'
        WHEN 'macklynengao@gmail.com' THEN '28224470'
        WHEN 'oyahmic@gmail.com' THEN '13384321'
        WHEN 'oduorcecelia@gmail.com' THEN '37809140'
        WHEN 'kavitamwima@gmail.com' THEN '28185563'
        WHEN 'munyanya1978@gmail.com' THEN '22033510'
        WHEN 'bettysang2@gmail.com' THEN '22502034'
        WHEN 'leahmbuya54@gmail.com' THEN '25086930'
        WHEN 'alfredmacharia84@gmail.com' THEN '25598272'
        WHEN 'damianaoduor@mtrh.go.ke' THEN '24326548'
        WHEN 'amkiprop@gmail.com' THEN '30137971'
        WHEN 'alexanderlokrole@mtrh.go.ke' THEN '20085319'
        WHEN 'jackline.amakobbe@gmail.com' THEN '22984565'
        WHEN 'jackmbaka09@gmail.com' THEN '24119521'
        WHEN 'carolnyagu123@gmail.com' THEN '24361729'
        WHEN 'nyosenya@gmail.com' THEN '22396670'
        WHEN 'carolinekemunto@gmail.com' THEN '12925216'
    END,
    u.mobile,
    CASE 
        WHEN u.fname IN ('Rose', 'Jane', 'Elizabeth', 'Phoebe', 'Macklyne', 'Cecelia', 'Mary', 'Roseanne', 'Betty', 'Leah', 'Damiana', 'Jackline', 'Carol', 'Caroline') THEN 'Female'
        ELSE 'Male'
    END,
    CASE u.email
        WHEN 'jackmbaka09@gmail.com' THEN 'Clinical Officer'
        WHEN 'oduorcecelia@gmail.com' THEN 'Clinical Officer'
        WHEN 'carolnyagu123@gmail.com' THEN 'Clinical Officer'
        ELSE 'Nurse'
    END,
    'active',
    CASE u.email
        WHEN 'nyakanarose91@gmail.com' THEN -1.297297
        WHEN 'janemwikamba@gmail.com' THEN -1.189189
        WHEN 'lizzmwikah@gmail.com' THEN -1.530797
        WHEN 'hellensey3@gmail.com' THEN -0.108108
        WHEN 'macklynengao@gmail.com' THEN -1.315315
        WHEN 'oyahmic@gmail.com' THEN -0.090090
        WHEN 'oduorcecelia@gmail.com' THEN -0.324324
        WHEN 'kavitamwima@gmail.com' THEN -1.153153
        WHEN 'munyanya1978@gmail.com' THEN -1.350145
        WHEN 'bettysang2@gmail.com' THEN -1.297297
        WHEN 'leahmbuya54@gmail.com' THEN -1.319606
        WHEN 'alfredmacharia84@gmail.com' THEN 0.472877
        WHEN 'damianaoduor@mtrh.go.ke' THEN 0.514399
        WHEN 'amkiprop@gmail.com' THEN 0.504505
        WHEN 'alexanderlokrole@mtrh.go.ke' THEN 0.522523
        WHEN 'jackline.amakobbe@gmail.com' THEN 0.504505
        WHEN 'jackmbaka09@gmail.com' THEN -0.324324
        WHEN 'carolnyagu123@gmail.com' THEN -0.476399
        WHEN 'nyosenya@gmail.com' THEN -1.315315
        WHEN 'carolinekemunto@gmail.com' THEN -1.279279
    END,
    CASE u.email
        WHEN 'nyakanarose91@gmail.com' THEN 36.802226
        WHEN 'janemwikamba@gmail.com' THEN 36.908850
        WHEN 'lizzmwikah@gmail.com' THEN 37.264272
        WHEN 'hellensey3@gmail.com' THEN 34.756819
        WHEN 'macklynengao@gmail.com' THEN 36.802490
        WHEN 'oyahmic@gmail.com' THEN 34.576619
        WHEN 'oduorcecelia@gmail.com' THEN 37.658261
        WHEN 'kavitamwima@gmail.com' THEN 36.944419
        WHEN 'munyanya1978@gmail.com' THEN 36.936473
        WHEN 'bettysang2@gmail.com' THEN 36.802226
        WHEN 'leahmbuya54@gmail.com' THEN 36.710070
        WHEN 'alfredmacharia84@gmail.com' THEN 35.306358
        WHEN 'damianaoduor@mtrh.go.ke' THEN 35.281075
        WHEN 'amkiprop@gmail.com' THEN 35.280647
        WHEN 'alexanderlokrole@mtrh.go.ke' THEN 35.298765
        WHEN 'jackline.amakobbe@gmail.com' THEN 35.280647
        WHEN 'jackmbaka09@gmail.com' THEN 37.658261
        WHEN 'carolnyagu123@gmail.com' THEN 37.123011
        WHEN 'nyosenya@gmail.com' THEN 36.802490
        WHEN 'carolinekemunto@gmail.com' THEN 36.783943
    END,
    NOW(),
    NOW()
FROM user u
WHERE u.role = 'doctor' 
AND u.email IN (
    'nyakanarose91@gmail.com', 'janemwikamba@gmail.com', 'lizzmwikah@gmail.com', 
    'hellensey3@gmail.com', 'macklynengao@gmail.com', 'oyahmic@gmail.com',
    'oduorcecelia@gmail.com', 'kavitamwima@gmail.com', 'munyanya1978@gmail.com',
    'bettysang2@gmail.com', 'leahmbuya54@gmail.com', 'alfredmacharia84@gmail.com',
    'damianaoduor@mtrh.go.ke', 'amkiprop@gmail.com', 'alexanderlokrole@mtrh.go.ke',
    'jackline.amakobbe@gmail.com', 'jackmbaka09@gmail.com', 'carolnyagu123@gmail.com',
    'nyosenya@gmail.com', 'carolinekemunto@gmail.com'
)
AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = u.id);

SELECT 'All doctors loaded successfully!' AS Status;
SELECT COUNT(*) AS 'Total Doctor Users' FROM user WHERE role = 'doctor';
SELECT COUNT(*) AS 'Total Doctor Records' FROM doctors;
SELECT fname, lname, mobile, dr_type FROM doctors ORDER BY id DESC LIMIT 10;
