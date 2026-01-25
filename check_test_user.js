
const mysql = require('mysql2/promise');

async function checkTestUser() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');
    const email = 'mettoalex@gmail.com';

    console.log('Checking Users table...');
    const [users] = await connection.execute('SELECT id, email, role FROM users WHERE email = ?', [email]);
    console.log('Users found:', users);

    console.log('Checking Doctors table...');
    const [doctors] = await connection.execute('SELECT id, email, dr_type FROM doctors WHERE email = ?', [email]);
    console.log('Doctors found:', doctors);

    await connection.end();
}

checkTestUser().catch(console.error);
