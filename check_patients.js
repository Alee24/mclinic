
const mysql = require('mysql2/promise');

async function checkPatients() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');
    console.log('--- PATIENTS ---');
    const [patients] = await connection.execute('SELECT email FROM patients LIMIT 5');
    console.log(patients);
    await connection.end();
}

checkPatients().catch(console.error);
