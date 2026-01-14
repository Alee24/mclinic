const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mclinicportal',
    });

    try {
        console.log('🗑️  Starting database cleanup...');

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        console.log(`Found ${tableNames.length} tables to clear`);

        // Delete all records from each table
        for (const tableName of tableNames) {
            await connection.query(`DELETE FROM \`${tableName}\``);
            console.log(`✅ Cleared table: ${tableName}`);
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✨ Database cleared successfully!');
        console.log('All records have been removed from all tables.');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        await connection.end();
    }
}

clearDatabase();
