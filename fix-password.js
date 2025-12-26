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
        const password = 'Digital2025';
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Generated hash:', hashedPassword);

        console.log('Updating doc@gmail.com password...');
        await conn.promise().query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'doc@gmail.com']);
        console.log('Password updated.');

        const [rows] = await conn.promise().query('SELECT id, email, role, password FROM users');
        console.log('All Users:', rows);

    } catch (err) {
        console.error(err);
    } finally {
        conn.end();
    }
}

run();
