const mysql = require('mysql2/promise');

async function clearDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mclinic'
    });

    try {
        console.log('🗑️  Clearing all data from database...');

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        console.log(`Found ${tableNames.length} tables to clear`);

        // Truncate each table
        for (const tableName of tableNames) {
            console.log(`  Clearing table: ${tableName}`);
            await connection.query(`TRUNCATE TABLE \`${tableName}\``);
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Database cleared successfully!');
        console.log(`   ${tableNames.length} tables truncated`);

    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

clearDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
