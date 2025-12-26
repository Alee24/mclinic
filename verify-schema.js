const mysql = require('mysql2/promise');

async function verifySchema() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            database: 'mclinic',
            password: ''
        });

        console.log('Verifying patients table columns...');
        const [cols] = await connection.execute('SHOW COLUMNS FROM patients');
        const fields = cols.map(c => c.Field);
        console.log('Columns:', fields);

        const required = ['blood_group', 'allergies', 'medical_history', 'emergency_contact_name'];
        const missing = required.filter(r => !fields.includes(r));

        if (missing.length > 0) {
            console.log('MISSING COLUMNS:', missing);
        } else {
            console.log('ALL REQUIRED COLUMNS PRESENT.');
        }

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

verifySchema();
