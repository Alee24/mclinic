const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env from current directory or parent
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

async function repair() {
    const dbName = process.env.DB_NAME || "m_clinic";
    console.log(`Starting repair for database: ${dbName}`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: dbName
    });

    try {
        console.log("Step 1: Attempting to clear corrupted 'doctors' tablespace...");
        try {
            // Force discard if it exists in any state
            await connection.execute('ALTER TABLE doctors DISCARD TABLESPACE');
            console.log("- Successfully discarded existing tablespace.");
        } catch (e) {
            console.log("- No existing tablespace to discard or table missing from engine. Continuing...");
        }

        console.log("Step 2: Dropping old table definition...");
        try {
            await connection.execute('DROP TABLE IF EXISTS doctors');
            console.log("- Dropped table successfully.");
        } catch (e) {
            console.log("- Drop command failed (expected if extremely corrupted):", e.message);
        }

        console.log("Step 3: Recreating 'doctors' table with original schema...");
        const ddl = `
        CREATE TABLE \`doctors\` (
          \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
          \`fname\` varchar(40) DEFAULT NULL,
          \`lname\` varchar(50) DEFAULT NULL,
          \`username\` varchar(40) DEFAULT NULL,
          \`national_id\` varchar(20) DEFAULT NULL,
          \`email\` varchar(40) NOT NULL,
          \`dob\` varchar(20) DEFAULT NULL,
          \`reg_code\` varchar(50) DEFAULT NULL,
          \`user_id\` int(11) DEFAULT NULL,
          \`Verified_status\` tinyint(4) NOT NULL DEFAULT 0,
          \`approved_status\` varchar(50) NOT NULL DEFAULT 'Pending',
          \`password\` varchar(255) DEFAULT NULL,
          \`mobile\` varchar(20) DEFAULT NULL,
          \`address\` varchar(255) DEFAULT NULL,
          \`balance\` decimal(28,2) NOT NULL DEFAULT 0.00,
          \`sex\` varchar(20) DEFAULT NULL,
          \`qualification\` varchar(255) DEFAULT NULL,
          \`speciality\` varchar(255) DEFAULT NULL,
          \`dr_type\` varchar(50) NOT NULL DEFAULT 'Nurse',
          \`about\` text DEFAULT NULL,
          \`slot_type\` tinyint(4) DEFAULT NULL,
          \`latitude\` decimal(10,6) DEFAULT NULL,
          \`longitude\` decimal(10,6) DEFAULT NULL,
          \`fee\` int(11) NOT NULL DEFAULT 1500,
          \`serial_or_slot\` text DEFAULT NULL,
          \`start_time\` varchar(40) DEFAULT NULL,
          \`end_time\` varchar(40) DEFAULT NULL,
          \`serial_day\` int(11) NOT NULL DEFAULT 0,
          \`max_serial\` int(11) NOT NULL DEFAULT 0,
          \`duration\` int(11) NOT NULL DEFAULT 0,
          \`department_id\` int(11) DEFAULT NULL,
          \`location_id\` int(11) DEFAULT NULL,
          \`licenceNo\` varchar(20) DEFAULT NULL,
          \`licenceExpiry\` timestamp NULL DEFAULT NULL,
          \`residance\` varchar(100) DEFAULT NULL,
          \`regulatory_body\` varchar(50) DEFAULT NULL,
          \`years_of_experience\` int(11) NOT NULL DEFAULT 0,
          \`hospital_attachment\` varchar(150) DEFAULT NULL,
          \`telemedicine\` tinyint(4) NOT NULL DEFAULT 0,
          \`on_call\` tinyint(4) NOT NULL DEFAULT 0,
          \`featured\` tinyint(4) NOT NULL DEFAULT 0,
          \`status\` tinyint(4) NOT NULL DEFAULT 0,
          \`is_online\` tinyint(4) NOT NULL DEFAULT 0,
          \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          \`updated_at\` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
          \`profile_image\` varchar(255) DEFAULT NULL,
          \`signatureUrl\` varchar(255) DEFAULT NULL,
          \`stampUrl\` varchar(255) DEFAULT NULL,
          \`approvalStatus\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
          \`rejectionReason\` text DEFAULT NULL,
          \`licenseExpiryDate\` date DEFAULT NULL,
          \`licenseStatus\` enum('valid','expiring_soon','expired') NOT NULL DEFAULT 'valid',
          \`lastLicenseCheck\` datetime DEFAULT NULL,
          \`approvedAt\` datetime DEFAULT NULL,
          \`approvedBy\` bigint(20) DEFAULT NULL,
          \`otp\` varchar(10) DEFAULT NULL,
          \`otpExpiry\` datetime DEFAULT NULL,
          \`resetToken\` varchar(100) DEFAULT NULL,
          \`resetTokenExpiry\` datetime DEFAULT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`IDX_2832138eb3e9d8e8b7941cb\` (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

        await connection.execute(ddl);
        console.log("- Table 'doctors' successfully recreated.");

    } catch (error) {
        console.error("!!! REPAIR FAILED !!!");
        console.error(error.message);
        if (error.message.includes("exists")) {
            console.log("\nTIP: If the tablespace still exists, you MUST manually delete the file:");
            console.log(`rm /var/lib/mysql/${dbName}/doctors.ibd`);
            console.log("Then run this script again.");
        }
    } finally {
        await connection.end();
    }
}

repair();
