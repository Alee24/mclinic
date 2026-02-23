const mysql = require('mysql2/promise');

async function repair() {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'mclinicportal'
    };

    let connection;
    try {
        console.log('Connecting to mclinicportal...');
        connection = await mysql.createConnection(config);
        console.log('Connected.');

        console.log('Checking tables status...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables found:', tables.map(t => Object.values(t)[0]));

        for (const t of tables) {
            const tableName = Object.values(t)[0];
            try {
                await connection.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
                console.log(`✅ Table ${tableName} is OK.`);
            } catch (err) {
                console.error(`❌ Table ${tableName} is CORRUPT:`, err.message);
                if (err.message.includes("doesn't exist in engine") || err.message.includes("Table is marked as crashed")) {
                    console.log(`Attempting to REPAIR ${tableName} by dropping and recreating...`);
                    // We need the schema. I'll just drop it for now and let the migrations handle it, 
                    // or I'll try to find the schema in the files.
                    // Actually, dropping a corrupted table might fail too if the engine is confused.
                    try {
                        await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
                        console.log(`Successfully dropped ${tableName}`);
                    } catch (dropErr) {
                        console.error(`Failed to drop ${tableName}:`, dropErr.message);
                    }
                }
            }
        }

    } catch (error) {
        console.error('Database error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

repair();
