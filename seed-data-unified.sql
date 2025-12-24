-- M-Clinic Database Seeding Script with Kenyan Names (Updated for Users Table)
-- Run this script to populate the database with dummy data

USE mclinic;

-- Clear existing data (in reverse order of dependencies)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointment;
TRUNCATE TABLE invoice;
TRUNCATE TABLE transaction;
TRUNCATE TABLE service;
TRUNCATE TABLE doctors;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users (Patients with role='patient')
INSERT INTO user (email, password, role, fname, lname, mobile, dob, sex, address, city, status, createdAt, updatedAt) VALUES
('mary.wambui@example.com', '$2b$10$hashedpassword1', 'patient', 'Mary', 'Wambui', '0722111001', '1985-03-15', 'Female', 'Kileleshwa, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('john.kamau@example.com', '$2b$10$hashedpassword2', 'patient', 'John', 'Kamau', '0733222002', '1990-07-22', 'Male', 'Westlands, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('lucy.achieng@example.com', '$2b$10$hashedpassword3', 'patient', 'Lucy', 'Achieng', '0744333003', '1988-11-30', 'Female', 'Kilimani, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('david.mwangi@example.com', '$2b$10$hashedpassword4', 'patient', 'David', 'Mwangi', '0755444004', '1992-05-18', 'Male', 'Parklands, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('jane.nyambura@example.com', '$2b$10$hashedpassword5', 'patient', 'Jane', 'Nyambura', '0766555005', '1987-09-25', 'Female', 'Lavington, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('samuel.otieno@example.com', '$2b$10$hashedpassword6', 'patient', 'Samuel', 'Otieno', '0777666006', '1995-02-14', 'Male', 'South B, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('rose.chebet@example.com', '$2b$10$hashedpassword7', 'patient', 'Rose', 'Chebet', '0788777007', '1991-12-08', 'Female', 'Karen, Nairobi', 'Nairobi', 1, NOW(), NOW()),
('patrick.mutua@example.com', '$2b$10$hashedpassword8', 'patient', 'Patrick', 'Mutua', '0799888008', '1989-06-20', 'Male', 'Langata, Nairobi', 'Nairobi', 1, NOW(), NOW());

-- Insert Users for Doctors (role='doctor')
INSERT INTO user (email, password, role, fname, lname, mobile, status, createdAt, updatedAt) VALUES
('dr.wanjiku@mclinic.com', '$2b$10$hashedpassword9', 'doctor', 'Grace', 'Wanjiku', '0712345001', 1, NOW(), NOW()),
('dr.omondi@mclinic.com', '$2b$10$hashedpassword10', 'doctor', 'James', 'Omondi', '0723456002', 1, NOW(), NOW()),
('dr.akinyi@mclinic.com', '$2b$10$hashedpassword11', 'doctor', 'Faith', 'Akinyi', '0734567003', 1, NOW(), NOW()),
('dr.kipchoge@mclinic.com', '$2b$10$hashedpassword12', 'doctor', 'Daniel', 'Kipchoge', '0745678004', 1, NOW(), NOW()),
('dr.njoroge@mclinic.com', '$2b$10$hashedpassword13', 'doctor', 'Peter', 'Njoroge', '0756789005', 1, NOW(), NOW());

-- Insert Doctors (linked to doctor users)
INSERT INTO doctors (user_id, fname, lname, specialty, dr_type, phone, email, status, latitude, longitude, createdAt, updatedAt) VALUES
(9, 'Grace', 'Wanjiku', 'General Practice', 'General Practitioner', '0712345001', 'dr.wanjiku@mclinic.com', 'active', -1.286389, 36.817223, NOW(), NOW()),
(10, 'James', 'Omondi', 'Pediatrics', 'Pediatrician', '0723456002', 'dr.omondi@mclinic.com', 'active', -1.292066, 36.821946, NOW(), NOW()),
(11, 'Faith', 'Akinyi', 'Obstetrics & Gynecology', 'OB/GYN', '0734567003', 'dr.akinyi@mclinic.com', 'active', -1.300000, 36.830000, NOW(), NOW()),
(12, 'Daniel', 'Kipchoge', 'Cardiology', 'Cardiologist', '0745678004', 'dr.kipchoge@mclinic.com', 'inactive', -1.280000, 36.815000, NOW(), NOW()),
(13, 'Peter', 'Njoroge', 'Orthopedics', 'Orthopedic Surgeon', '0756789005', 'dr.njoroge@mclinic.com', 'active', -1.295000, 36.825000, NOW(), NOW());

-- Insert Services
INSERT INTO service (name, description, price, duration, isActive, createdAt, updatedAt) VALUES
('General Consultation', 'Standard medical consultation with a doctor', 2500.00, 30, 1, NOW(), NOW()),
('Pediatric Consultation', 'Specialized consultation for children', 3000.00, 45, 1, NOW(), NOW()),
('Prenatal Checkup', 'Routine prenatal examination for expectant mothers', 3500.00, 60, 1, NOW(), NOW()),
('Cardiac Screening', 'Comprehensive heart health assessment', 5000.00, 90, 1, NOW(), NOW()),
('Orthopedic Consultation', 'Consultation for bone and joint issues', 4000.00, 45, 1, NOW(), NOW()),
('Lab Tests - Basic', 'Basic blood work and urinalysis', 1500.00, 15, 1, NOW(), NOW()),
('Lab Tests - Comprehensive', 'Full panel blood tests', 3500.00, 20, 1, NOW(), NOW()),
('Vaccination', 'Standard immunization service', 1000.00, 15, 1, NOW(), NOW()),
('Home Visit', 'Doctor visit to patient home', 6000.00, 120, 1, NOW(), NOW()),
('Virtual Consultation', 'Online video consultation with doctor', 2000.00, 30, 1, NOW(), NOW());

-- Insert Appointments
INSERT INTO appointment (patientId, doctorId, serviceId, appointment_date, appointment_time, fee, status, notes, createdAt, updatedAt) VALUES
(1, 1, 1, '2025-12-26', '09:00', 2500.00, 'confirmed', 'Regular checkup', NOW(), NOW()),
(2, 2, 2, '2025-12-26', '10:30', 3000.00, 'confirmed', 'Child vaccination follow-up', NOW(), NOW()),
(3, 3, 3, '2025-12-27', '11:00', 3500.00, 'pending', 'Monthly prenatal visit', NOW(), NOW()),
(4, 1, 1, '2025-12-27', '14:00', 2500.00, 'confirmed', 'Follow-up consultation', NOW(), NOW()),
(5, 5, 5, '2025-12-28', '09:30', 4000.00, 'pending', 'Knee pain assessment', NOW(), NOW()),
(6, 2, 2, '2025-12-28', '15:00', 3000.00, 'confirmed', 'Pediatric consultation', NOW(), NOW()),
(7, 1, 10, '2025-12-29', '10:00', 2000.00, 'confirmed', 'Virtual consultation', NOW(), NOW()),
(8, 3, 3, '2025-12-29', '13:00', 3500.00, 'pending', 'Prenatal checkup', NOW(), NOW()),
(1, 1, 6, '2025-12-23', '10:00', 1500.00, 'completed', 'Blood tests completed', NOW(), NOW()),
(2, 2, 8, '2025-12-22', '11:30', 1000.00, 'completed', 'Vaccination administered', NOW(), NOW());

-- Insert Invoices
INSERT INTO invoice (invoiceNumber, customerName, customerEmail, totalAmount, status, dueDate, createdAt, updatedAt) VALUES
('INV-2025-001', 'Mary Wambui', '0722111001', 2500.00, 'pending', '2025-12-26', NOW(), NOW()),
('INV-2025-002', 'John Kamau', '0733222002', 3000.00, 'pending', '2025-12-26', NOW(), NOW()),
('INV-2025-003', 'Lucy Achieng', '0744333003', 3500.00, 'pending', '2025-12-27', NOW(), NOW()),
('INV-2025-004', 'David Mwangi', '0755444004', 2500.00, 'pending', '2025-12-27', NOW(), NOW()),
('INV-2025-005', 'Jane Nyambura', '0766555005', 4000.00, 'pending', '2025-12-28', NOW(), NOW()),
('INV-2025-006', 'Samuel Otieno', '0777666006', 3000.00, 'pending', '2025-12-28', NOW(), NOW()),
('INV-2025-007', 'Rose Chebet', '0788777007', 2000.00, 'pending', '2025-12-29', NOW(), NOW()),
('INV-2025-008', 'Patrick Mutua', '0799888008', 3500.00, 'pending', '2025-12-29', NOW(), NOW()),
('INV-2025-009', 'Mary Wambui', '0722111001', 1500.00, 'paid', '2025-12-23', NOW(), NOW()),
('INV-2025-010', 'John Kamau', '0733222002', 1000.00, 'paid', '2025-12-22', NOW(), NOW());

-- Insert Transactions (for paid invoices)
INSERT INTO transaction (reference, amount, type, source, status, createdAt) VALUES
('MPE123456789', 1500.00, 'credit', 'MPESA', 'completed', '2025-12-23 10:30:00'),
('MPE987654321', 1000.00, 'credit', 'MPESA', 'completed', '2025-12-22 12:15:00'),
('CASH001', 2500.00, 'credit', 'CASH', 'completed', '2025-12-20 14:00:00'),
('VISA789', 3000.00, 'credit', 'VISA', 'completed', '2025-12-21 09:45:00'),
('MPE555444333', 3500.00, 'credit', 'MPESA', 'completed', '2025-12-19 16:20:00');

-- Display summary
SELECT 'Database seeded successfully!' AS Status;
SELECT COUNT(*) AS 'Total Users' FROM user;
SELECT COUNT(*) AS 'Total Patients' FROM user WHERE role = 'patient';
SELECT COUNT(*) AS 'Total Doctors (users)' FROM user WHERE role = 'doctor';
SELECT COUNT(*) AS 'Total Doctors (table)' FROM doctors;
SELECT COUNT(*) AS 'Total Services' FROM service;
SELECT COUNT(*) AS 'Total Appointments' FROM appointment;
SELECT COUNT(*) AS 'Total Invoices' FROM invoice;
SELECT COUNT(*) AS 'Total Transactions' FROM transaction;
