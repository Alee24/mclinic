const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "mclinicportal"
        });

        const [doctors] = await connection.execute('SELECT COUNT(*) as count FROM doctors');
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const roles = ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'admin'];
        const [providers] = await connection.execute(
            `SELECT COUNT(*) as count FROM users WHERE role IN (${roles.map(r => `'${r}'`).join(',')})`
        );

        console.log(`Doctors in 'doctors' table: ${doctors[0].count}`);
        console.log(`Users in 'users' table: ${users[0].count}`);
        console.log(`Users with provider roles: ${providers[0].count}`);

        await connection.end();
    } catch (error) {
        console.error("Error during check:", error);
    }
}

check();
