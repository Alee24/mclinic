const mysql = require('mysql2/promise');
async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'mclinic'
        });
        const [rows] = await conn.execute('SELECT * FROM system_setting WHERE `key` = "FEE_BOOKING"');
        console.log(JSON.stringify(rows));
        await conn.end();
    } catch (e) {
        console.error(e.message);
    }
}
run();
