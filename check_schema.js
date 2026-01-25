
const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');
    const [columns] = await connection.execute('SHOW COLUMNS FROM doctors');
    console.log('Columns in doctors:', columns.map(c => c.Field));
    await connection.end();
}

checkSchema().catch(console.error);
