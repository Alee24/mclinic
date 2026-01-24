const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mclinic'
    });

    const email = 'mettoalex@gmail.com';
    // Hash for "Digital2025"
    const hash = '$2b$10$s0kgtJ1FgpTk5jW1T5CwiuDpt2Jn3zeSNICuU16vvejZPyInkG26O';

    try {
        const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            console.log(`Updating existing user ${email} to ADMIN...`);
            await conn.query('UPDATE users SET password = ?, role = "admin", status = 1 WHERE email = ?', [hash, email]);
        } else {
            console.log(`Creating new ADMIN user ${email}...`);
            await conn.query(`
                INSERT INTO users (email, password, role, status, fname, lname) 
                VALUES (?, ?, 'admin', 1, 'Alex', 'Metto')
            `, [email, hash]);
        }
        console.log('✅ Success! Login with: mettoalex@gmail.com / Digital2025');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await conn.end();
    }
}

main();
