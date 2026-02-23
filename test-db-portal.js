const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Testing connection to mclinicportal...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'mclinicportal'
        });
        console.log('✅ Connection SUCCESSFUL!');
        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables:', rows.map(r => Object.values(r)[0]).join(', '));
        await connection.end();
    } catch (error) {
        console.error('❌ Connection FAILED:', error.message);
        process.exit(1);
    }
}

testConnection();
