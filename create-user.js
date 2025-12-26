const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mclinic'
});

async function run() {
    try {
        const hash = '$2b$10$s0kgtJ1FgpTk5jW1T5CwiuDpt2Jn3zeSNICuU16vvejZPyInkG26O'; // Digital2025

        console.log('Creating user mettoalex@gmail.com...');
        const [res] = await conn.promise().query(`
            INSERT INTO users (email, password, role, status, fname, lname) 
            VALUES (?, ?, 'patient', 1, 'Alex', 'Metto')
        `, ['mettoalex@gmail.com', hash]);

        console.log('User created:', res.insertId);

    } catch (err) {
        console.error(err);
    } finally {
        conn.end();
    }
}

run();
