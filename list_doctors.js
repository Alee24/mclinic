
const mysql = require('mysql2/promise');

async function listDoctors() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');
    const [doctors] = await connection.execute('SELECT email, dr_type, password FROM doctors LIMIT 5');
    console.log('Doctors:', doctors.map(d => ({ email: d.email, dr_type: d.dr_type, hasPassword: !!d.password })));
    await connection.end();
}

listDoctors().catch(console.error);
