USE mclinic;

-- Insert sample doctors from existing database
INSERT INTO doctors (fname, lname, national_id, email, reg_code, Verified_status, approved_status, password, mobile, sex, speciality, dr_type, latitude, longitude, status, created_at, updated_at) VALUES
('Benedict', 'Koech', '30882221', 'benedictkoech@gmail.com', '459TY9', 1, 'Approved', '$2a$10$K0fch8InZHgLVW04JhkGVuvadAO00jbeEgqXOCO2WEHi59TNypVD6', '0705227980', 'Male', 'Maternal Health Nursing/Midwife', 'Nurse', -1.315315, 36.784467, 1, NOW(), NOW()),
('Sharon', 'Muhanda', '33854832', 'smuhanda588@gmail.com', '8TC6QD', 1, 'Approved', '$2a$10$49eBGCYCYLzKC.db1iTO1.6M4SxP9Wv9xaFm/BYIUVBlY/025XQX2', '0792236249', 'Female', 'Palliative and Hospice Nursing', 'Nurse', -1.225225, 36.855273, 1, NOW(), NOW()),
('Kelvin', 'Ndambuki', '28148147', 'kmunyao22@gmail.com', '998337', 1, 'Approved', '$2a$10$Z03dL4GGr5HlZFjZi5hS5u0nTzuyGQWZ9qu/mL7WeuE5f08//Fj7W', '0729739072', 'Male', 'Reproductive Health', 'Clinical Officer', -1.297297, 36.802226, 1, NOW(), NOW()),
('Jackline', 'Wanja', '13361878', 'jackiewanja@gmail.com', '883827', 1, 'Approved', '$2a$10$pI.4/eMDyPq4wCxHRlM3reaINiXwb3WaHBoiFBfx7QNAGXlH6/Rre', '0722247769', 'Female', 'Operating Room (OR) Nursing', 'Nurse', -1.369369, 36.965512, 1, NOW(), NOW()),
('Olivia', 'Ochieng', '31626064', 'olivialesly@gmail.com', '3D7396', 1, 'Approved', '$2a$10$whvMaxD.tt4.W4TKzINGjeBtz7OQbLcQhN4PspoM5PIS2t2WAS5ha', '0700887780', 'Female', 'Community Health Nursing', 'Nurse', -0.414414, 34.199093, 1, NOW(), NOW()),
('Grace', 'Wanjiku', '25957465', 'wanjiku.grace@gmail.com', '45D988', 1, 'Approved', '$2a$10$LG4/BD6HJ6ncU5xe9s1jk.IHbHb7Ct8/I7arfqoQ4Av/JCvmScCta', '0724260971', 'Female', 'General Practice', 'General Practitioner', -1.297297, 36.748158, 1, NOW(), NOW()),
('James', 'Omondi', '39847242', 'omondi.james@gmail.com', '83Q7TD', 1, 'Approved', '$2a$10$s91IJu1aU1wy6gEHj29ZQuXUsZRhQv4raqiIIRAOQCbweYvb1skXG', '0710107044', 'Male', 'Pediatrics', 'Pediatrician', -0.522523, 37.461017, 1, NOW(), NOW()),
('Rose', 'Nyakana', '28103362', 'nyakanarose91@gmail.com', '126834', 1, 'Approved', '$2a$10$h1xBqcM7vLaOI7Zt4Xzm1uNW9zRQMBY2PZTS7Jh3lv86qdmzuwqG.', '0729223943', 'Female', 'Community Health Nursing', 'Nurse', -1.286389, 36.817223, 1, NOW(), NOW()),
('Jane', 'Mwikamba', '27964845', 'janemwikamba@gmail.com', '24TYT6', 1, 'Approved', '$2a$10$3B4no6ASC2fabcCwtgTp4.rJlVXNr/omXPyLJzzH8vraZPtkbWSUi', '0725057082', 'Female', 'Community Health Nursing', 'Nurse', -1.189189, 36.908850, 1, NOW(), NOW()),
('Peter', 'Njoroge', '21874093', 'njoroge.peter@gmail.com', '9DGDCT', 1, 'Approved', '$2a$10$f4UkARwhNfGRfcbhRc67Uudk7dq5OrN2iFHXOe53xPyqViRM3TuF6', '0728766884', 'Male', 'Orthopedics', 'Orthopedic Surgeon', -1.530797, 37.264272, 1, NOW(), NOW());

SELECT 'Doctors loaded successfully!' AS Status;
SELECT COUNT(*) AS 'Total Doctors' FROM doctors;
