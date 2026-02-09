const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mclinicportal'
    });

    console.log('Connected to database');

    // Hash password: Digital2025
    const password = await bcrypt.hash('Digital2025', 10);
    console.log('Password hashed');

    try {
        // 1. Admin User
        await connection.execute(
            `INSERT INTO users (email, password, fname, lname, role, status, mobile, emailVerifiedAt, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), updatedAt = NOW()`,
            ['admin@mclinic.co.ke', password, 'Admin', 'User', 'admin', 1, '0700000001']
        );
        console.log('✓ Admin user created/updated');

        // 2. Patient User
        await connection.execute(
            `INSERT INTO users (email, password, fname, lname, role, status, mobile, emailVerifiedAt, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), updatedAt = NOW()`,
            ['patient@mclinic.co.ke', password, 'Test', 'Patient', 'patient', 1, '0700000002']
        );
        console.log('✓ Patient user created/updated');

        // 3. Doctor User
        await connection.execute(
            `INSERT INTO doctors (email, password, fname, lname, phone, dr_type, speciality, licenceNo, reg_code, status, Verified_status, approvalStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), status = 1, approvalStatus = 'approved', updatedAt = NOW()`,
            ['doctor@mclinic.co.ke', password, 'Dr. Test', 'Doctor', '0700000003', 'Doctor', 'General Practice', 'DOC001', 'REG001', 1, 1, 'approved']
        );
        console.log('✓ Doctor user created/updated');

        // 4. Nurse User
        await connection.execute(
            `INSERT INTO doctors (email, password, fname, lname, phone, dr_type, speciality, licenceNo, reg_code, status, Verified_status, approvalStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), status = 1, approvalStatus = 'approved', updatedAt = NOW()`,
            ['nurse@mclinic.co.ke', password, 'Test', 'Nurse', '0700000004', 'Nurse', 'General Nursing', 'NUR001', 'REG002', 1, 1, 'approved']
        );
        console.log('✓ Nurse user created/updated');

        // 5. Clinician User
        await connection.execute(
            `INSERT INTO doctors (email, password, fname, lname, phone, dr_type, speciality, licenceNo, reg_code, status, Verified_status, approvalStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), status = 1, approvalStatus = 'approved', updatedAt = NOW()`,
            ['clinician@mclinic.co.ke', password, 'Test', 'Clinician', '0700000005', 'Clinical Officer', 'General Medicine', 'CLI001', 'REG003', 1, 1, 'approved']
        );
        console.log('✓ Clinician user created/updated');

        // 6. Lab Tech User
        await connection.execute(
            `INSERT INTO doctors (email, password, fname, lname, phone, dr_type, speciality, licenceNo, reg_code, status, Verified_status, approvalStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), status = 1, approvalStatus = 'approved', updatedAt = NOW()`,
            ['labtech@mclinic.co.ke', password, 'Test', 'LabTech', '0700000006', 'Laboratory Technician', 'Laboratory', 'LAB001', 'REG004', 1, 1, 'approved']
        );
        console.log('✓ Lab Tech user created/updated');

        // 7. Pharmacist User
        await connection.execute(
            `INSERT INTO doctors (email, password, fname, lname, phone, dr_type, speciality, licenceNo, reg_code, status, Verified_status, approvalStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE password = VALUES(password), status = 1, approvalStatus = 'approved', updatedAt = NOW()`,
            ['pharmacist@mclinic.co.ke', password, 'Test', 'Pharmacist', '0700000007', 'Pharmacist', 'Pharmacy', 'PHA001', 'REG005', 1, 1, 'approved']
        );
        console.log('✓ Pharmacist user created/updated');

        console.log('\n=================================');
        console.log('All test users created successfully!');
        console.log('=================================\n');
        console.log('Login credentials for all users:');
        console.log('Password: Digital2025\n');
        console.log('Admin:      admin@mclinic.co.ke');
        console.log('Patient:    patient@mclinic.co.ke');
        console.log('Doctor:     doctor@mclinic.co.ke');
        console.log('Nurse:      nurse@mclinic.co.ke');
        console.log('Clinician:  clinician@mclinic.co.ke');
        console.log('Lab Tech:   labtech@mclinic.co.ke');
        console.log('Pharmacist: pharmacist@mclinic.co.ke');
        console.log('=================================\n');

    } catch (error) {
        console.error('Error creating test users:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

createTestUsers()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
