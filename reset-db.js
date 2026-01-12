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
        console.log('⚠️  DROPPING ALL TABLES...');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        if (tableNames.length > 0) {
            console.log(`Found ${tableNames.length} tables. Dropping...`);
            await connection.query(`DROP TABLE IF EXISTS ${tableNames.join(', ')}`);
        } else {
            console.log('No tables found.');
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Database reset successfully! Now start the API in DEV mode to recreate tables.');

    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
    } finally {
        await connection.end();
    }
}

resetDatabase();
