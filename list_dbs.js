
const mysql = require('mysql2/promise');

async function listDbs() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306');
    const [dbs] = await connection.execute('SHOW DATABASES');
    console.log('Databases:', dbs);
    await connection.end();
}

listDbs().catch(console.error);
