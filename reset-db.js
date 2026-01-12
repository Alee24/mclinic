const mysql = require('mysql2/promise');

async function resetDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'm-cl-app',
        password: 'Mclinic@App2023?',
        database: 'mclinic',
        multipleStatements: true
    });

    try {
        console.log('⚠️  DROPPING DATABASE mclinic...');

        // 1. Drop Database
        await connection.query('DROP DATABASE IF EXISTS mclinic');

        // 2. Recreate Database
        console.log('✨  Recreating Database...');
        await connection.query('CREATE DATABASE mclinic');

        // 3. Select Database
        await connection.changeUser({ database: 'mclinic' });

        console.log('✅ Database reset successfully! Now start the API in DEV mode to recreate tables.');

    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
    } finally {
        await connection.end();
    }
}

resetDatabase();
