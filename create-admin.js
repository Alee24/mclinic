const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdminUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mclinicportal'
    });

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('Digital2025', 10);

        // Insert admin user
        const [result] = await connection.execute(`
            INSERT INTO users (email, password, role, fname, lname, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
                password = VALUES(password),
                role = VALUES(role),
                status = VALUES(status)
        `, [
            'mettoalex@gmail.com',
            hashedPassword,
            'admin',
            'Admin',
            'User',
            true
        ]);

        console.log('✅ Admin user created successfully!');
        console.log('Email: mettoalex@gmail.com');
        console.log('Password: Digital2025');
        console.log('Role: admin');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        await connection.end();
    }
}

createAdminUser();
