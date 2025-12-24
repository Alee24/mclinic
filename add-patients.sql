USE mclinic;

-- Insert sample patients into users table
INSERT INTO user (email, password, role, fname, lname, mobile, dob, sex, city, status, createdAt, updatedAt) VALUES
('mary.wambui@test.com', '$2b$10$hashedpassword1', 'patient', 'Mary', 'Wambui', '0722111001', '1985-03-15', 'Female', 'Nairobi', 1, NOW(), NOW()),
('john.kamau@test.com', '$2b$10$hashedpassword2', 'patient', 'John', 'Kamau', '0733222002', '1990-07-22', 'Male', 'Nairobi', 1, NOW(), NOW()),
('lucy.achieng@test.com', '$2b$10$hashedpassword3', 'patient', 'Lucy', 'Achieng', '0744333003', '1988-11-30', 'Female', 'Nairobi', 1, NOW(), NOW()),
('david.mwangi@test.com', '$2b$10$hashedpassword4', 'patient', 'David', 'Mwangi', '0755444004', '1992-05-18', 'Male', 'Nairobi', 1, NOW(), NOW()),
('jane.nyambura@test.com', '$2b$10$hashedpassword5', 'patient', 'Jane', 'Nyambura', '0766555005', '1987-09-25', 'Female', 'Nairobi', 1, NOW(), NOW());

SELECT 'Patients added successfully!' AS Status;
SELECT COUNT(*) AS 'Total Patients' FROM user WHERE role = 'patient';
