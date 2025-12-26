const mysql = require('mysql2/promise');

async function test() {
    console.log('Testing connection to MySQL...');
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'mclinic' // Try with database
        });
        console.log('Successfully connected to "mclinic" database!');
        await connection.end();
    } catch (err) {
        console.error('Failed to connect to "mclinic":', err.message);

        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Database "mclinic" does not exist. Trying to connect without DB...');
            try {
                const conn2 = await mysql.createConnection({
                    host: '127.0.0.1',
                    user: 'root',
                    password: ''
                });
                console.log('Connected to MySQL server (no DB selected). Creating "mclinic"...');
                await conn2.query('CREATE DATABASE IF NOT EXISTS mclinic');
                console.log('Database "mclinic" created.');
                await conn2.end();
            } catch (err2) {
                console.error('Failed to connect to MySQL server:', err2.message);
            }
        }
    }
}

test();
