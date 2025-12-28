
const { createConnection } = require('mysql2/promise');

async function checkData() {
    const connection = await createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mclinic',
        password: ''
    });

    try {
        console.log('--- FETCHING SPECIFIC DOCTOR ---');
        const [doctors] = await connection.execute('SELECT id, email, fname, lname, balance FROM doctors WHERE email = "doc@gmail.com"');
        console.table(doctors);

        const [allDocs] = await connection.execute('SELECT id, email, fname, lname, balance FROM doctors WHERE fname="Doctor" AND lname="One"');
        console.table(allDocs);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkData();
