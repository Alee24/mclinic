const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Testing connection to mclinic...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'mclinic'
        });
        console.log('✅ Connection SUCCESSFUL!');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection FAILED:', error.message);
        process.exit(1);
    }
}

testConnection();
