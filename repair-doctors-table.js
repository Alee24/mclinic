const mysql = require('mysql2/promise');

async function repair() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "mclinicportal"
        });

        console.log("Attempting aggressive drop of corrupted doctors table...");
        try {
            // First try simple drop
            await connection.execute('DROP TABLE IF EXISTS doctors');
            console.log("Dropped via standard command.");
        } catch (e) {
            console.log("Standard drop failed, trying DISCARD then DROP...");
            try {
                // If it exists in engine but corrupted
                await connection.execute('ALTER TABLE doctors DISCARD TABLESPACE');
            } catch (e2) {
                console.log("Discard failed (maybe already discarded), continuing to drop...");
            }
            try {
                await connection.execute('DROP TABLE doctors');
                console.log("Dropped via secondary attempt.");
            } catch (e3) {
                console.log("Final drop attempt failed. We may need to manually remove the .ibd file.");
                throw e3;
            }
        }

        console.log("Recreating doctors table...");
        // I'll use the DDL from the entity or migration
        const ddl = `
        CREATE TABLE \`doctors\` (
          \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
          \`fname\` varchar(40) DEFAULT NULL,
          \`lname\` varchar(50) DEFAULT NULL,
          \`username\` varchar(40) DEFAULT NULL,
          \`national_id\` varchar(20) DEFAULT NULL,
          \`email\` varchar(40) NOT NULL,
          \`dob\` varchar(20) DEFAULT NULL,
          \`reg_code\` varchar(50) DEFAULT NULL,
          \`user_id\` int(11) DEFAULT NULL,
          \`Verified_status\` tinyint(4) DEFAULT '0',
          \`approved_status\` varchar(50) DEFAULT 'Pending',
          \`password\` varchar(255) DEFAULT NULL,
          \`mobile\` varchar(20) DEFAULT NULL,
          \`address\` varchar(255) DEFAULT NULL,
          \`balance\` decimal(28,2) DEFAULT '0.00',
          \`sex\` varchar(20) DEFAULT NULL,
          \`qualification\` varchar(255) DEFAULT NULL,
          \`speciality\` varchar(255) DEFAULT NULL,
          \`dr_type\` varchar(50) DEFAULT 'Nurse',
          \`about\` text,
          \`slot_type\` tinyint(4) DEFAULT NULL,
          \`latitude\` decimal(10,6) DEFAULT NULL,
          \`longitude\` decimal(10,6) DEFAULT NULL,
          \`fee\` int(11) DEFAULT '1500',
          \`serial_or_slot\` text,
          \`start_time\` varchar(40) DEFAULT NULL,
          \`end_time\` varchar(40) DEFAULT NULL,
          \`serial_day\` int(11) DEFAULT '0',
          \`max_serial\` int(11) DEFAULT '0',
          \`duration\` int(11) DEFAULT '0',
          \`department_id\` int(11) DEFAULT NULL,
          \`location_id\` int(11) DEFAULT NULL,
          \`licenceNo\` varchar(20) DEFAULT NULL,
          \`licenceExpiry\` timestamp NULL DEFAULT NULL,
          \`residance\` varchar(100) DEFAULT NULL,
          \`regulatory_body\` varchar(50) DEFAULT NULL,
          \`years_of_experience\` int(11) DEFAULT '0',
          \`hospital_attachment\` varchar(150) DEFAULT NULL,
          \`telemedicine\` tinyint(4) DEFAULT '0',
          \`on_call\` tinyint(4) DEFAULT '0',
          \`featured\` tinyint(4) DEFAULT '0',
          \`status\` tinyint(4) DEFAULT '0',
          \`is_online\` tinyint(4) DEFAULT '0',
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          \`profile_image\` varchar(255) DEFAULT NULL,
          \`signatureUrl\` varchar(255) DEFAULT NULL,
          \`stampUrl\` varchar(255) DEFAULT NULL,
          \`approvalStatus\` enum('pending','approved','rejected') DEFAULT 'pending',
          \`rejectionReason\` text,
          \`licenseExpiryDate\` date DEFAULT NULL,
          \`licenseStatus\` enum('valid','expiring_soon','expired') DEFAULT 'valid',
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
        console.log("Doctors table recreated successfully.");

        await connection.end();
    } catch (error) {
        console.error("Error during repair:", error);
    }
}

repair();
