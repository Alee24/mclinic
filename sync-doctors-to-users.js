const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function syncDoctorsToUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mclinicportal'
    });

    console.log('Connected to database');

    try {
        // 1. Get all doctors
        const [doctors] = await connection.execute(
            'SELECT id, email, fname, lname, mobile, dr_type FROM doctors WHERE email IS NOT NULL'
        );

        console.log(`Found ${doctors.length} doctors to process`);

        let created = 0;
        let skipped = 0;
        const defaultPassword = await bcrypt.hash('Digital2025', 10);

        for (const doctor of doctors) {
            // Check if user exists
            const [existingUsers] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [doctor.email]
            );

            if (existingUsers.length > 0) {
                console.log(`✓ User already exists for ${doctor.email}`);
                skipped++;

                // Link doctor to user if not already linked
                await connection.execute(
                    'UPDATE doctors SET user_id = ? WHERE id = ? AND user_id IS NULL',
                    [existingUsers[0].id, doctor.id]
                );
                continue;
            }

            // Create user entry for doctor
            const role = mapDrTypeToRole(doctor.dr_type);

            const [result] = await connection.execute(
                `INSERT INTO users (email, password, fname, lname, mobile, role, status, emailVerifiedAt, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
                [
                    doctor.email,
                    defaultPassword,
                    doctor.fname || 'Doctor',
                    doctor.lname || 'User',
                    doctor.mobile || '0700000000',
                    role,
                    1
                ]
            );

            const userId = result.insertId;
            created++;

            // Link doctor to user
            await connection.execute(
                'UPDATE doctors SET user_id = ? WHERE id = ?',
                [userId, doctor.id]
            );

            // Create wallet for user
            await connection.execute(
                'INSERT INTO wallets (user_id, balance, currency, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE updatedAt = NOW()',
                [userId, 0, 'KES']
            );

            console.log(`✓ Created user and wallet for ${doctor.email} (Role: ${role})`);
        }

        console.log('\n=================================');
        console.log('Doctor-to-User Sync Complete!');
        console.log('=================================');
        console.log(`Created: ${created}`);
        console.log(`Skipped: ${skipped}`);
        console.log('=================================\n');
        console.log('All doctors now have user entries and wallets!');
        console.log('Wallet crediting will work for M-Pesa payments.');

    } catch (error) {
        console.error('Error syncing doctors:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

function mapDrTypeToRole(drType) {
    if (!drType) return 'doctor';
    const type = drType.toLowerCase();
    if (type.includes('nurse')) return 'nurse';
    if (type.includes('clinical')) return 'clinician';
    if (type.includes('lab')) return 'lab_tech';
    if (type.includes('pharm')) return 'pharmacist';
    return 'doctor';
}

syncDoctorsToUsers()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
