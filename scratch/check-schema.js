const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('--- DOCTORS COLUMNS ---');
    const [docCols] = await connection.query('SHOW COLUMNS FROM doctors');
    console.table(docCols);

    console.log('\n--- USERS COLUMNS ---');
    const [userCols] = await connection.query('SHOW COLUMNS FROM users');
    console.table(userCols);

    await connection.end();
}

checkSchema().catch(console.error);
