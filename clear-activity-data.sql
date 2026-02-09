-- ============================================================================
-- CLEAR ACTIVITY DATA FROM MCLINIC DATABASE
-- ============================================================================
-- This script removes all transactional/activity data while preserving:
-- - User accounts (patients, doctors, staff)
-- - User profiles and medical information
-- - Reference data (services, medications, departments, etc.)
-- - Doctor schedules and credentials
-- ============================================================================

-- Disable foreign key checks to allow deletion
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- CLEAR TRANSACTIONAL/ACTIVITY DATA
-- ============================================================================
-- Using DELETE instead of TRUNCATE to avoid foreign key constraint issues
-- Deleting in reverse dependency order (child tables first, then parents)

-- Reviews (references appointment)
DELETE FROM `reviews`;

-- Invoice items (child of invoice)
DELETE FROM `invoice_item`;

-- Transactions (references invoice) - MUST DELETE BEFORE INVOICE
DELETE FROM `transaction`;

-- Invoices (references appointment)
DELETE FROM `invoice`;

-- Prescription items (child of prescription)
DELETE FROM `prescription_item`;

-- Prescriptions (references appointment)
DELETE FROM `prescription`;

-- Medical records (references appointment)
DELETE FROM `medical_record`;

-- Lab results (child of lab_order)
DELETE FROM `lab_result`;

-- Lab orders
DELETE FROM `lab_order`;

-- Pharmacy order items (child of pharmacy_order)
DELETE FROM `pharmacy_order_item`;

-- Pharmacy orders
DELETE FROM `pharmacy_order`;

-- M-Pesa transactions
DELETE FROM `mpesa_transaction`;

-- Ambulance subscriptions
DELETE FROM `ambulance_subscriptions`;

-- Appointments (now safe to delete after all dependent data is removed)
DELETE FROM `appointment`;

-- ============================================================================
-- OPTIONAL: RESET AUTO-INCREMENT COUNTERS
-- ============================================================================
-- Uncomment these lines if you want to reset ID counters to 1
-- ALTER TABLE `appointment` AUTO_INCREMENT = 1;
-- ALTER TABLE `prescription` AUTO_INCREMENT = 1;
-- ALTER TABLE `medical_record` AUTO_INCREMENT = 1;
-- ALTER TABLE `lab_order` AUTO_INCREMENT = 1;
-- ALTER TABLE `pharmacy_order` AUTO_INCREMENT = 1;
-- ALTER TABLE `invoice` AUTO_INCREMENT = 1;
-- ALTER TABLE `transaction` AUTO_INCREMENT = 1;
-- ALTER TABLE `mpesa_transaction` AUTO_INCREMENT = 1;
-- ALTER TABLE `lab_result` AUTO_INCREMENT = 1;
-- ALTER TABLE `prescription_item` AUTO_INCREMENT = 1;
-- ALTER TABLE `invoice_item` AUTO_INCREMENT = 1;
-- ALTER TABLE `reviews` AUTO_INCREMENT = 1;
-- ALTER TABLE `ambulance_subscriptions` AUTO_INCREMENT = 1;

-- ============================================================================
-- OPTIONAL: RESET WALLET BALANCES TO ZERO
-- ============================================================================
-- Uncomment the lines below if you want to reset all wallet balances to 0
-- UPDATE `wallets` SET `balance` = 0.00;
-- UPDATE `doctors` SET `balance` = 0.00;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the results:
SELECT 
    'Users' as Table_Name, COUNT(*) as Record_Count FROM users
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Medical Profiles', COUNT(*) FROM medical_profiles
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointment
UNION ALL
SELECT 'Medical Records', COUNT(*) FROM medical_record
UNION ALL
SELECT 'Prescriptions', COUNT(*) FROM prescription
UNION ALL
SELECT 'Lab Orders', COUNT(*) FROM lab_order
UNION ALL
SELECT 'Pharmacy Orders', COUNT(*) FROM pharmacy_order
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoice
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transaction
UNION ALL
SELECT 'Ambulance Subscriptions', COUNT(*) FROM ambulance_subscriptions
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
ORDER BY Table_Name;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- PRESERVED:
-- ✓ All user accounts (users table)
-- ✓ Doctor profiles and credentials (doctors, doctor_licences, doctor_schedules)
-- ✓ Patient profiles (patients, medical_profiles)
-- ✓ Wallet structure (balances can be reset manually above)
-- ✓ All reference data (departments, services, medications, etc.)
-- 
-- CLEARED:
-- ✗ All appointments
-- ✗ All medical records
-- ✗ All prescriptions
-- ✗ All lab orders and results
-- ✗ All pharmacy orders
-- ✗ All invoices and financial transactions
-- ✗ All ambulance subscriptions
-- ✗ All reviews
-- ============================================================================
