
const mysql = require('mysql2/promise');

async function countRecords() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');
    const [[{ "COUNT(*)": uCount }]] = await connection.execute('SELECT COUNT(*) FROM users');
    const [[{ "COUNT(*)": dCount }]] = await connection.execute('SELECT COUNT(*) FROM doctors');
    console.log('Users count:', uCount);
    console.log('Doctors count:', dCount);
    await connection.end();
}

countRecords().catch(console.error);
