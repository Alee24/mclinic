USE mclinic;

-- Insert sample patients into users table
INSERT INTO user (email, password, role, fname, lname, mobile, dob, sex, city, status, createdAt, updatedAt) VALUES
('mary.wambui@test.com', '$2b$10$hashedpassword1', 'patient', 'Mary', 'Wambui', '0722111001', '1985-03-15', 'Female', 'Nairobi', 1, NOW(), NOW()),
('john.kamau@test.com', '$2b$10$hashedpassword2', 'patient', 'John', 'Kamau', '0733222002', '1990-07-22', 'Male', 'Nairobi', 1, NOW(), NOW()),
('lucy.achieng@test.com', '$2b$10$hashedpassword3', 'patient', 'Lucy', 'Achieng', '0744333003', '1988-11-30', 'Female', 'Nairobi', 1, NOW(), NOW()),
('david.mwangi@test.com', '$2b$10$hashedpassword4', 'patient', 'David', 'Mwangi', '0755444004', '1992-05-18', 'Male', 'Nairobi', 1, NOW(), NOW()),
('jane.nyambura@test.com', '$2b$10$hashedpassword5', 'patient', 'Jane', 'Nyambura', '0766555005', '1987-09-25', 'Female', 'Nairobi', 1, NOW(), NOW()),
('samuel.otieno@test.com', '$2b$10$hashedpassword6', 'patient', 'Samuel', 'Otieno', '0777666006', '1995-02-14', 'Male', 'Nairobi', 1, NOW(), NOW()),
('rose.chebet@test.com', '$2b$10$hashedpassword7', 'patient', 'Rose', 'Chebet', '0788777007', '1991-12-08', 'Female', 'Nairobi', 1, NOW(), NOW()),
('patrick.mutua@test.com', '$2b$10$hashedpassword8', 'patient', 'Patrick', 'Mutua', '0799888008', '1989-06-20', 'Male', 'Nairobi', 1, NOW(), NOW());

-- Insert Services
INSERT INTO service (name, description, price, duration, isActive, createdAt, updatedAt) VALUES
('General Consultation', 'Standard medical consultation with a doctor', 2500.00, 30, 1, NOW(), NOW()),
('Pediatric Consultation', 'Specialized consultation for children', 3000.00, 45, 1, NOW(), NOW()),
('Prenatal Checkup', 'Routine prenatal examination for expectant mothers', 3500.00, 60, 1, NOW(), NOW()),
('Lab Tests - Basic', 'Basic blood work and urinalysis', 1500.00, 15, 1, NOW(), NOW()),
('Vaccination', 'Standard immunization service', 1000.00, 15, 1, NOW(), NOW());

SELECT 'Data seeded successfully!' AS Status;
SELECT COUNT(*) AS 'Total Patients' FROM user WHERE role = 'patient';
SELECT COUNT(*) AS 'Total Services' FROM service;
