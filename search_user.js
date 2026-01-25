
const mysql = require('mysql2/promise');

async function searchUser() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');

    console.log('Searching Users table...');
    const [users] = await connection.execute("SELECT email, role FROM users WHERE email LIKE '%kiplimo%'");
    console.log('Users found:', users);

    console.log('Searching Doctors table...');
    const [doctors] = await connection.execute("SELECT email, dr_type FROM doctors WHERE email LIKE '%kiplimo%'");
    console.log('Doctors found:', doctors);

    await connection.end();
}

searchUser().catch(console.error);
