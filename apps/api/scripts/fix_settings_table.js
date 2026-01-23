const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Load .env from apps/api

async function fixTable() {
    console.log('🔧 Fixing system_setting table...');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(dbUrl);
        console.log('✅ Connected to database.');

        // Drop weird table
        await connection.execute('DROP TABLE IF EXISTS system_setting');
        console.log('🗑️  Dropped old system_setting table.');

        // Create correct table matching Prisma schema
        const createSql = `
            CREATE TABLE system_setting (
                \`key\` varchar(191) NOT NULL,
                \`value\` text NOT NULL,
                \`description\` varchar(191) DEFAULT NULL,
                \`isSecure\` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (\`key\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.execute(createSql);
        console.log('✨ Created new system_setting table with correct schema.');

        // Insert default M-Pesa env settings if available
        const settings = [
            'MPESA_ENV', 'MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET',
            'MPESA_PASSKEY', 'MPESA_SHORTCODE', 'MPESA_CALLBACK_URL'
        ];

        for (const key of settings) {
            const val = process.env[key];
            if (val) {
                await connection.execute(
                    'INSERT IGNORE INTO system_setting (`key`, `value`, `description`, `isSecure`) VALUES (?, ?, ?, ?)',
                    [key, val, 'Imported from .env', key.includes('KEY') || key.includes('SECRET')]
                );
                console.log(`   -> Imported ${key}`);
            }
        }

        await connection.end();
        console.log('✅ Fix complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixTable();
