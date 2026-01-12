const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
    console.log('Connecting to DB...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mclinic'
    });

    try {
        console.log('Attempting to add role column...');
        // We use VARCHAR to be safe and compatible with both TypeORM and Prisma Enums if getting specific is hard
        // But let's try strict ENUM to match Prisma
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN role ENUM('patient', 'doctor', 'admin', 'lab_tech', 'nurse', 'clinician', 'medic', 'finance', 'pharmacist') 
            NOT NULL DEFAULT 'patient';
        `);
        console.log('✅ Role column added successfully!');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Column "role" already exists.');
        } else {
            console.error('❌ Failed to add column:', e.message);
        }
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
