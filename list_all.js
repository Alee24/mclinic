
const mysql = require('mysql2/promise');

async function listAll() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');

    console.log('--- USERS ---');
    const [users] = await connection.execute('SELECT email, role FROM users');
    console.log(users);

    console.log('--- DOCTORS ---');
    const [doctors] = await connection.execute('SELECT email, dr_type FROM doctors');
    console.log(doctors);

    await connection.end();
}

listAll().catch(console.error);
