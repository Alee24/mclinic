const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mclinic'
});

async function run() {
    try {
        const hash = await bcrypt.hash('Digital2025', 10);
        console.log('New Hash:', hash);

        const [res] = await conn.promise().query('UPDATE users SET password = ? WHERE email = ?', [hash, 'mettoalex@gmail.com']);
        console.log('Update result:', res);

    } catch (err) {
        console.error(err);
    } finally {
        conn.end();
    }
}

run();
