const mysql = require('mysql2/promise');

async function dropTable() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'mclinic',
    });

    try {
        console.log('Dropping medical_record table...');
        await connection.execute('DROP TABLE IF EXISTS medical_record');
        console.log('Table dropped successfully.');
    } catch (error) {
        console.error('Error dropping table:', error);
    } finally {
        await connection.end();
    }
}

dropTable();
