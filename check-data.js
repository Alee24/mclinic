
const { createConnection } = require('mysql2/promise');

async function checkData() {
    const connection = await createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mclinic',
        password: '' // Common local dev password
    });

    try {
        console.log('--- Checking User Doctor One ---');
        // Search by name similarity or email if known
        const [users] = await connection.execute('SELECT id, email, role, fname, lname FROM user WHERE fname LIKE "%Doctor%" OR lname LIKE "%One%" OR role = "doctor"');
        console.table(users);

        console.log('\n--- Checking Doctor Entity Doctor One ---');
        const [doctors] = await connection.execute('SELECT id, email, fname, lname, balance FROM doctors WHERE fname LIKE "%Doctor%" OR lname LIKE "%One%"');
        console.table(doctors);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkData();
