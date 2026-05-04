const mysql = require('mysql2/promise');
async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'mclinic'
        });
        await conn.execute('UPDATE system_setting SET value = "0" WHERE `key` = "FEE_BOOKING"');
        console.log('Successfully set FEE_BOOKING to 0 in database.');
        await conn.end();
    } catch (e) {
        console.error(e.message);
    }
}
run();
