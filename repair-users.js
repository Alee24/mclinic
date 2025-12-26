const mysql = require('mysql2');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mclinic'
});

async function run() {
    try {
        console.log('Adding role column to users table...');
        await conn.promise().query(`
            ALTER TABLE users 
            ADD COLUMN role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient' AFTER password
        `);
        console.log('Role column added.');

        console.log('Updating existing users to have role=patient...');
        await conn.promise().query(`UPDATE users SET role='patient' WHERE role IS NULL`);
        console.log('Updated.');

    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error(err);
        }
    } finally {
        conn.end();
    }
}

run();
