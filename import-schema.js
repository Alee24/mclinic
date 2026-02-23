const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSchema() {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        multipleStatements: true
    };

    let connection;
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, 'COMPLETE_DATABASE_SCHEMA.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection(config);
        console.log('Connected.');

        console.log('DROPPING database mclinicportal to clear orphaned tablespaces...');
        await connection.query('DROP DATABASE IF EXISTS mclinicportal');
        console.log('Database dropped.');

        console.log('CREATING database mclinicportal...');
        await connection.query('CREATE DATABASE mclinicportal');
        await connection.query('USE mclinicportal');
        console.log('Database created and selected.');

        console.log('Executing schema...');
        await connection.query(sql);
        console.log('✅ Schema imported successfully!');

    } catch (error) {
        console.error('❌ Error importing schema:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

importSchema();
