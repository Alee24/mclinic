USE mclinic;

-- Disable foreign key checks to allow truncating tables with relationships
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data from tables (in order of dependencies)
TRUNCATE TABLE appointment;
TRUNCATE TABLE invoice;
TRUNCATE TABLE transaction;
TRUNCATE TABLE service;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
TRUNCATE TABLE user;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables are empty
SELECT 'Database cleared successfully!' AS Status;
SELECT 
    (SELECT COUNT(*) FROM user) AS users,
    (SELECT COUNT(*) FROM doctors) AS doctors,
    (SELECT COUNT(*) FROM patients) AS patients,
    (SELECT COUNT(*) FROM service) AS services,
    (SELECT COUNT(*) FROM appointment) AS appointments,
    (SELECT COUNT(*) FROM invoice) AS invoices,
    (SELECT COUNT(*) FROM transaction) AS transactions;
