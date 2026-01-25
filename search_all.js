
const mysql = require('mysql2/promise');

async function searchAll() {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/mclinicportal');

    const [tables] = await connection.execute('SHOW TABLES');
    for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0];
        try {
            const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName}`);
            const hasEmail = columns.some(c => c.Field.toLowerCase().includes('email'));
            if (hasEmail) {
                const [rows] = await connection.execute(`SELECT * FROM ${tableName} WHERE email LIKE '%kiplimo%'`);
                if (rows.length > 0) {
                    console.log(`Found in table ${tableName}:`, rows);
                }
            }
        } catch (e) {
            // console.error(`Error searching ${tableName}`, e);
        }
    }

    await connection.end();
}

searchAll().catch(console.error);
