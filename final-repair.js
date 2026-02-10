const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function repair() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "m_clinic"
    });

    try {
        console.log(`Targeting database: ${process.env.DB_NAME || "m_clinic"}`);

        console.log("Attempt 1: Drop if exists...");
        try {
            await connection.execute('DROP TABLE IF EXISTS doctors');
            console.log("Standard drop command executed.");
        } catch (e) {
            console.log("Standard drop failed:", e.message);
        }

        console.log("Attempt 2: Create a dummy table to take over the tablespace...");
        try {
            await connection.execute(`
                CREATE TABLE doctors (
                    id BIGINT PRIMARY KEY
                ) ENGINE=InnoDB
            `);
            console.log("Dummy table created.");
        } catch (e) {
            console.log("Create dummy failed:", e.message);
            if (e.message.includes("exists")) {
                console.log("Ghost tablespace confirmed. Attempting to discard...");
                try {
                    await connection.execute('ALTER TABLE doctors DISCARD TABLESPACE');
                    console.log("Tablespace discarded via ALTER.");
                } catch (e2) {
                    console.log("Discard failed:", e2.message);
                }
            }
        }

        console.log("Attempt 3: Final Drop...");
        try {
            await connection.execute('DROP TABLE IF EXISTS doctors');
            console.log("Final drop successful.");
        } catch (e) {
            console.log("Final drop failed:", e.message);
        }

        console.log("Attempt 4: Recreating full doctors table schema...");
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
          UNIQUE KEY \`IDX_DOCTOR_EMAIL\` (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await connection.execute(ddl);
        console.log("Doctors table recreated successfully!");

    } catch (error) {
        console.error("Repair failed fatal:", error.message);
    } finally {
        await connection.end();
    }
}

repair();
