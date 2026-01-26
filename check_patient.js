
const mysql = require('mysql2/promise');

async function checkUser() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');
    console.log('--- PATIENT CHECK ---');
    const [users] = await connection.execute("SELECT email, role FROM users WHERE email = 'test_kiplimo@yahoo.com'");
    console.log(users);
    await connection.end();
}

checkUser().catch(console.error);
