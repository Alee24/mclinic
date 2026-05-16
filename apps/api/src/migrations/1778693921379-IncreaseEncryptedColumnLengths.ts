import { MigrationInterface, QueryRunner } from "typeorm";

export class IncreaseEncryptedColumnLengths1778693921379 implements MigrationInterface {
    name = 'IncreaseEncryptedColumnLengths1778693921379'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safe Index Drops
        try { await queryRunner.query(`DROP INDEX \`IDX_email\` ON \`users\``); } catch (e) {}
        try { await queryRunner.query(`DROP INDEX \`IDX_doctor_email\` ON \`doctors\``); } catch (e) {}
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`wallets\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`user_id\` bigint UNSIGNED NOT NULL, \`balance\` decimal(28,2) NOT NULL DEFAULT '0.00', \`currency\` varchar(255) NOT NULL DEFAULT 'KES', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`system_setting\` (\`key\` varchar(255) NOT NULL, \`value\` text NOT NULL, \`description\` varchar(255) NULL, \`isSecure\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`key\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`support_requests\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NULL, \`email\` varchar(255) NULL, \`mobile\` varchar(255) NULL, \`message\` text NOT NULL, \`status\` enum ('OPEN', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN', \`adminResponse\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`doctor_schedules\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`doctor_id\` bigint UNSIGNED NOT NULL, \`slot_type\` tinyint NULL COMMENT '1=Serial, 2=Time', \`start_time\` varchar(40) NULL, \`end_time\` varchar(40) NULL, \`duration\` int NOT NULL DEFAULT '0', \`max_serial\` int NOT NULL DEFAULT '0', \`serial_day\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`doctor_licences\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`doctor_id\` bigint UNSIGNED NOT NULL, \`licence_no\` varchar(20) NULL, \`expiry_date\` timestamp NULL, \`document\` varchar(255) NULL, \`verified\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`specialities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`description\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`services\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`price\` decimal(10,2) NOT NULL, \`duration\` int NOT NULL DEFAULT '30', \`is_active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`invoice_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`unitPrice\` decimal(10,2) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`invoiceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`invoice\` (\`id\` int NOT NULL AUTO_INCREMENT, \`invoiceNumber\` varchar(255) NOT NULL, \`customerName\` varchar(255) NOT NULL, \`customerEmail\` varchar(255) NOT NULL, \`totalAmount\` decimal(10,2) NOT NULL, \`status\` enum ('pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending', \`dueDate\` date NULL, \`customerMobile\` varchar(255) NULL, \`paymentMethod\` varchar(255) NULL, \`doctorId\` bigint UNSIGNED NULL, \`commissionAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`appointmentId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`appointment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`patientId\` bigint UNSIGNED NOT NULL, \`doctorId\` bigint UNSIGNED NULL, \`serviceId\` int NULL, \`appointment_date\` date NULL, \`appointment_time\` varchar(40) NULL, \`fee\` int NOT NULL DEFAULT '0', \`transportFee\` decimal(10,2) NOT NULL DEFAULT '0.00', \`status\` enum ('pending', 'confirmed', 'completed', 'cancelled', 'missed', 'rescheduled') NOT NULL DEFAULT 'pending', \`notes\` varchar(255) NULL, \`meetingLink\` varchar(255) NULL, \`meetingId\` varchar(255) NULL, \`reason\` text NULL, \`isVirtual\` tinyint NOT NULL DEFAULT 0, \`isForSelf\` tinyint NOT NULL DEFAULT 1, \`beneficiaryName\` varchar(255) NULL, \`beneficiaryGender\` varchar(255) NULL, \`beneficiaryAge\` varchar(255) NULL, \`beneficiaryRelation\` varchar(255) NULL, \`activeMedications\` text NULL, \`currentPrescriptions\` text NULL, \`homeAddress\` varchar(255) NULL, \`conciergeType\` varchar(255) NULL, \`durationHours\` int NOT NULL DEFAULT '6', \`isConcierge\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`reviews\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` int NOT NULL, \`comment\` text NULL, \`patientId\` bigint UNSIGNED NOT NULL, \`doctorId\` bigint UNSIGNED NOT NULL, \`appointmentId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_45a6cefc24d5af16842be69a65\` (\`appointmentId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`medication\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`category\` varchar(255) NULL, \`price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`stock\` int NOT NULL DEFAULT '0', \`image_url\` varchar(255) NULL, \`brandName\` varchar(255) NULL, \`genericName\` varchar(255) NULL, \`strength\` varchar(255) NULL, \`formulation\` varchar(255) NULL, \`requiresPrescription\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`prescription_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`prescriptionId\` int NOT NULL, \`medicationId\` int NULL, \`medicationName\` varchar(255) NOT NULL, \`dosage\` varchar(255) NULL, \`frequency\` varchar(255) NULL, \`duration\` varchar(255) NULL, \`quantity\` int NOT NULL DEFAULT '1', \`instructions\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`prescription\` (\`id\` int NOT NULL AUTO_INCREMENT, \`appointmentId\` int NULL, \`doctorId\` bigint UNSIGNED NOT NULL, \`doctorSignatureUrl\` varchar(255) NULL, \`doctorStampUrl\` varchar(255) NULL, \`patientId\` bigint UNSIGNED NOT NULL, \`status\` enum ('pending', 'ordered', 'dispensed', 'cancelled') NOT NULL DEFAULT 'pending', \`notes\` text NULL, \`validUntil\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`pharmacy_order_item\` (\`id\` varchar(36) NOT NULL, \`orderId\` varchar(255) NOT NULL, \`medicationId\` int NULL, \`medicationName\` varchar(255) NOT NULL, \`brandName\` varchar(255) NULL, \`genericName\` varchar(255) NULL, \`strength\` varchar(255) NULL, \`formulation\` varchar(255) NULL, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`subtotal\` decimal(10,2) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`pharmacy_order\` (\`id\` varchar(36) NOT NULL, \`userId\` bigint UNSIGNED NOT NULL, \`status\` enum ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`totalAmount\` decimal(10,2) NOT NULL, \`deliveryAddress\` varchar(255) NULL, \`deliveryCity\` varchar(255) NULL, \`contactPhone\` varchar(255) NULL, \`paymentMethod\` enum ('MPESA', 'CARD', 'CASH', 'INSURANCE') NOT NULL DEFAULT 'CASH', \`paymentStatus\` enum ('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING', \`transactionId\` varchar(255) NULL, \`prescriptionId\` varchar(255) NULL, \`invoiceId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`patients\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`user_id\` bigint UNSIGNED NULL, \`fname\` varchar(40) NULL, \`lname\` varchar(50) NULL, \`mobile\` varchar(40) NULL, \`dob\` varchar(20) NULL, \`sex\` varchar(20) NULL, \`address\` text NULL, \`city\` varchar(100) NULL, \`latitude\` decimal(10,8) NULL, \`longitude\` decimal(10,8) NULL, \`blood_group\` varchar(10) NULL, \`genotype\` text NULL, \`height\` decimal(5,2) NULL, \`weight\` decimal(5,2) NULL, \`allergies\` text NULL, \`medical_history\` text NULL, \`family_history\` text NULL, \`social_history\` text NULL, \`emergency_contact_name\` varchar(100) NULL, \`emergency_contact_phone\` varchar(255) NULL, \`emergency_contact_relation\` varchar(40) NULL, \`insurance_provider\` varchar(100) NULL, \`insurance_policy_no\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_7fe1518dc780fd777669b5cb7a\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`communication_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('email', 'sms') NOT NULL, \`recipient\` varchar(255) NOT NULL, \`subject\` varchar(255) NULL, \`content\` text NULL, \`status\` varchar(255) NOT NULL DEFAULT 'sent', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`mpesa_transaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`merchantRequestId\` varchar(255) NOT NULL, \`checkoutRequestId\` varchar(255) NOT NULL, \`phoneNumber\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`accountReference\` varchar(255) NULL, \`transactionDesc\` varchar(255) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'PENDING', \`resultCode\` varchar(255) NULL, \`resultDesc\` varchar(255) NULL, \`mpesaReceiptNumber\` varchar(255) NULL, \`transactionDate\` datetime NULL, \`relatedEntity\` varchar(255) NULL, \`relatedEntityId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`medical_record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`patientId\` bigint UNSIGNED NOT NULL, \`doctorId\` bigint UNSIGNED NOT NULL, \`appointmentId\` int NULL, \`diagnosis\` varchar(255) NOT NULL, \`prescription\` text NULL, \`notes\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`medical_profiles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` bigint UNSIGNED NOT NULL, \`blood_group\` varchar(10) NULL, \`genotype\` varchar(10) NULL, \`height\` float NULL, \`weight\` float NULL, \`allergies\` text NULL, \`medical_history\` text NULL, \`social_history\` text NULL, \`family_history\` text NULL, \`emergency_contact_name\` varchar(100) NULL, \`emergency_contact_phone\` varchar(40) NULL, \`emergency_contact_relation\` varchar(40) NULL, \`insurance_provider\` varchar(100) NULL, \`insurance_policy_no\` varchar(50) NULL, \`shif_number\` varchar(50) NULL, \`subscription_plan\` varchar(50) NOT NULL DEFAULT 'Pay-As-You-Go', \`current_medications\` text NULL, \`surgical_history\` text NULL, \`disability_status\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_3c17255bdf60f4cdba6704e1a5\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`locations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NULL, \`address\` varchar(255) NULL, \`latitude\` decimal(10,6) NULL, \`longitude\` decimal(10,6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`lab_test\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`price\` decimal(10,2) NOT NULL, \`category\` enum ('Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology', 'Other') NOT NULL DEFAULT 'Other', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`lab_order\` (\`id\` varchar(36) NOT NULL, \`patient_id\` bigint UNSIGNED NULL, \`test_id\` int NOT NULL, \`status\` enum ('pending', 'sample_received', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending', \`sample_collection_date\` datetime NULL, \`isForSelf\` tinyint NOT NULL DEFAULT 1, \`beneficiaryName\` varchar(255) NULL, \`beneficiaryAge\` varchar(255) NULL, \`beneficiaryGender\` varchar(255) NULL, \`beneficiaryRelation\` varchar(255) NULL, \`report_url\` varchar(255) NULL, \`technicianNotes\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`lab_result\` (\`id\` int NOT NULL AUTO_INCREMENT, \`order_id\` varchar(255) NOT NULL, \`parameter_name\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`unit\` varchar(255) NULL, \`reference_range\` varchar(255) NULL, \`notes\` text NULL, \`is_abnormal\` tinyint NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`transaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reference\` varchar(255) NULL, \`amount\` decimal(28,2) NOT NULL, \`type\` enum ('credit', 'debit') NOT NULL DEFAULT 'debit', \`source\` varchar(50) NOT NULL DEFAULT 'MPESA', \`status\` enum ('pending', 'completed', 'success', 'failed', 'cancelled') NOT NULL DEFAULT 'pending', \`userId\` bigint UNSIGNED NULL, \`invoiceId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`service_price\` (\`id\` int NOT NULL AUTO_INCREMENT, \`serviceName\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`currency\` varchar(255) NOT NULL DEFAULT 'KES', \`description\` text NULL, \`doctorId\` bigint UNSIGNED NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`payment_config\` (\`id\` int NOT NULL AUTO_INCREMENT, \`provider\` enum ('mpesa', 'visa', 'paypal') NOT NULL, \`credentials\` text NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`currency\` varchar(255) NOT NULL DEFAULT 'KES', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_894f3521047f139001c93e0d61\` (\`provider\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`emergency_alerts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`latitude\` decimal(10,8) NULL, \`longitude\` decimal(11,8) NULL, \`audioUrl\` varchar(255) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'active', \`notes\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`medicId\` bigint UNSIGNED NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`departments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`status\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`ambulance_subscriptions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` bigint UNSIGNED NULL, \`primary_subscriber_name\` varchar(255) NOT NULL, \`dob\` date NULL, \`gender\` varchar(20) NULL, \`identification_number\` varchar(50) NULL, \`nationality\` varchar(50) NULL, \`language_spoken\` varchar(50) NULL, \`photo_url\` varchar(255) NULL, \`primary_phone\` varchar(20) NOT NULL, \`secondary_phone\` varchar(20) NULL, \`email\` varchar(255) NULL, \`residential_address\` varchar(255) NULL, \`county\` varchar(255) NULL, \`estate\` varchar(255) NULL, \`street\` varchar(255) NULL, \`house_details\` varchar(255) NULL, \`landmark\` varchar(255) NULL, \`gps_coordinates\` text NULL, \`work_address\` varchar(255) NULL, \`blood_type\` varchar(10) NULL, \`allergies\` text NULL, \`chronic_conditions\` text NULL, \`current_medications\` text NULL, \`surgical_history\` text NULL, \`disabilities\` text NULL, \`pregnancy_status\` varchar(255) NULL, \`preferred_hospital\` varchar(255) NULL, \`insurance_details\` varchar(255) NULL, \`family_members\` json NULL, \`emergency_contacts\` json NULL, \`package_type\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'active', \`price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`commission\` decimal(10,2) NOT NULL DEFAULT '0.00', \`total_amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`start_date\` date NULL, \`end_date\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`ambulance_packages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`commission\` decimal(10,2) NOT NULL DEFAULT '0.00', \`validity_days\` int NOT NULL DEFAULT '365', \`features\` json NULL, \`is_group_package\` tinyint NOT NULL DEFAULT 0, \`min_members\` int NOT NULL DEFAULT '0', \`max_adults\` int NOT NULL DEFAULT '0', \`max_children\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_32fe00e126065ab738f0b1113a\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`doctor_specialities\` (\`doctor_id\` bigint UNSIGNED NOT NULL, \`speciality_id\` int NOT NULL, INDEX \`IDX_75b6ea0a12b0a3c394b0f24060\` (\`doctor_id\`), INDEX \`IDX_f89a875fe1236e2cbf4d729c32\` (\`speciality_id\`), PRIMARY KEY (\`doctor_id\`, \`speciality_id\`)) ENGINE=InnoDB`);
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`googleId\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationToken\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetToken\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetTokenExpires\` timestamp NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`otp\` varchar(10) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`otp_expires\` datetime NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`licenseNumber\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`specialization\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`bio\` text NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`isPublic\` tinyint NOT NULL DEFAULT 0`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`deletionRequestedAt\` timestamp NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`deletionScheduledAt\` timestamp NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` ADD \`last_access\` timestamp NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`approvalStatus\` varchar(20) NOT NULL DEFAULT 'pending'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`rejectionReason\` text NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`slot_type\` tinyint NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`latitude\` decimal(10,6) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`longitude\` decimal(10,6) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`serial_or_slot\` text NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`serial_day\` int NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`max_serial\` int NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`licenceExpiry\` timestamp NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`residance\` varchar(100) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`regulatory_body\` varchar(50) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`featured\` tinyint NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`status\` tinyint NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`profile_image\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`signatureUrl\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`stampUrl\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`otp\` varchar(10) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`otp_expires\` datetime NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`resetToken\` varchar(100) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`resetTokenExpiry\` datetime NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`can_prescribe\` tinyint NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`lastAccess\` timestamp NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`accepted_terms\` tinyint NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`onboarding_completed\` tinyint NOT NULL DEFAULT '0'`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`fname\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`fname\` varchar(255) NULL`);
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lname\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lname\` varchar(255) NULL`);
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`mobile\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`mobile\` varchar(255) NULL`);
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`national_id\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`national_id\` varchar(255) NULL`);
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`dob\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`dob\` varchar(255) NULL`);
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`sex\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`sex\` varchar(255) NULL`);
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address\` text NULL`);
        try { await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`national_id\``); } catch (e) {}
        await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`national_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`email\` \`email\` varchar(40) NOT NULL`);
        try { await queryRunner.query(`ALTER TABLE \`doctors\` ADD UNIQUE INDEX \`IDX_62069f52ebba471c91de5d59d6\` (\`email\`)`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`reg_code\` \`reg_code\` varchar(50) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`licenceNo\` \`licenceNo\` varchar(255) NULL`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctor_licences\` CHANGE \`licence_no\` \`licence_no\` varchar(255) NULL`); } catch (e) {}
        
        // Foreign Key Additions
        try { await queryRunner.query(`ALTER TABLE \`wallets\` ADD CONSTRAINT \`FK_92558c08091598f7a4439586cda\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctor_schedules\` ADD CONSTRAINT \`FK_a9562c0e3b99e62425d3356c88b\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctor_licences\` ADD CONSTRAINT \`FK_f397d334519b0656d74d27a474d\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`invoice_item\` ADD CONSTRAINT \`FK_553d5aac210d22fdca5c8d48ead\` FOREIGN KEY (\`invoiceId\`) REFERENCES \`invoice\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`invoice\` ADD CONSTRAINT \`FK_150d4d66fbf46ada8965e14294f\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`appointment\` ADD CONSTRAINT \`FK_5ce4c3130796367c93cd817948e\` FOREIGN KEY (\`patientId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`appointment\` ADD CONSTRAINT \`FK_514bcc3fb1b8140f85bf1cde6e2\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`appointment\` ADD CONSTRAINT \`FK_cee8b55c31f700609674da96b0b\` FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_e28a8c7515d12f28a1fb8022c12\` FOREIGN KEY (\`patientId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_c954aa19f3f500fc180000577ac\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_45a6cefc24d5af16842be69a65a\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`prescription_item\` ADD CONSTRAINT \`FK_0296aeae85365a980036bb7af48\` FOREIGN KEY (\`prescriptionId\`) REFERENCES \`prescription\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`prescription_item\` ADD CONSTRAINT \`FK_5d07e939f61a43c29fc84263e15\` FOREIGN KEY (\`medicationId\`) REFERENCES \`medication\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`prescription\` ADD CONSTRAINT \`FK_432108890b812a8a65eb964741e\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`prescription\` ADD CONSTRAINT \`FK_3e4a39a72939d42f31039f25ae6\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`prescription\` ADD CONSTRAINT \`FK_d9d1ecabc97e4de5c07a1795279\` FOREIGN KEY (\`patientId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`pharmacy_order_item\` ADD CONSTRAINT \`FK_1038c3ddd5551c043a5134079e7\` FOREIGN KEY (\`orderId\`) REFERENCES \`pharmacy_order\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`pharmacy_order_item\` ADD CONSTRAINT \`FK_3e83c7888039a8a32560ef6ba21\` FOREIGN KEY (\`medicationId\`) REFERENCES \`medication\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`pharmacy_order\` ADD CONSTRAINT \`FK_fe301667e65f4d6e16169455349\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`pharmacy_order\` ADD CONSTRAINT \`FK_b963c9da6056baa605e3bdf9983\` FOREIGN KEY (\`invoiceId\`) REFERENCES \`invoice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`patients\` ADD CONSTRAINT \`FK_7fe1518dc780fd777669b5cb7a0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_b53c9d9d9741bac9726574f34f7\` FOREIGN KEY (\`patientId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_3b1546f4a372400ada63bdc1287\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_27d877978f71f346a3c92c49836\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`medical_profiles\` ADD CONSTRAINT \`FK_3c17255bdf60f4cdba6704e1a5a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`lab_order\` ADD CONSTRAINT \`FK_ae79597e5e8038d403463944897\` FOREIGN KEY (\`patient_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`lab_order\` ADD CONSTRAINT \`FK_261e3a5af0cb1a997a68427c26f\` FOREIGN KEY (\`test_id\`) REFERENCES \`lab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`lab_result\` ADD CONSTRAINT \`FK_0577e4fc7a15627d4daab1c849d\` FOREIGN KEY (\`order_id\`) REFERENCES \`lab_order\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_605baeb040ff0fae995404cea37\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_17b930b7e4c1e8175fcb5ebca4b\` FOREIGN KEY (\`invoiceId\`) REFERENCES \`invoice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`service_price\` ADD CONSTRAINT \`FK_3c33552fe6f01379fa2a7a2c40a\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`emergency_alerts\` ADD CONSTRAINT \`FK_0dcff515e6a655537ec29dbf97e\` FOREIGN KEY (\`medicId\`) REFERENCES \`doctors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` ADD CONSTRAINT \`FK_c5c6bfd5994ed1636952d2d972b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctor_specialities\` ADD CONSTRAINT \`FK_75b6ea0a12b0a3c394b0f24060a\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctor_specialities\` ADD CONSTRAINT \`FK_f89a875fe1236e2cbf4d729c329\` FOREIGN KEY (\`speciality_id\`) REFERENCES \`specialities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`); } catch (e) {}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`doctor_specialities\` DROP FOREIGN KEY \`FK_f89a875fe1236e2cbf4d729c329\``);
        await queryRunner.query(`ALTER TABLE \`doctor_specialities\` DROP FOREIGN KEY \`FK_75b6ea0a12b0a3c394b0f24060a\``);
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP FOREIGN KEY \`FK_c5c6bfd5994ed1636952d2d972b\``);
        await queryRunner.query(`ALTER TABLE \`emergency_alerts\` DROP FOREIGN KEY \`FK_0dcff515e6a655537ec29dbf97e\``);
        await queryRunner.query(`ALTER TABLE \`service_price\` DROP FOREIGN KEY \`FK_3c33552fe6f01379fa2a7a2c40a\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_17b930b7e4c1e8175fcb5ebca4b\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_605baeb040ff0fae995404cea37\``);
        await queryRunner.query(`ALTER TABLE \`lab_result\` DROP FOREIGN KEY \`FK_0577e4fc7a15627d4daab1c849d\``);
        await queryRunner.query(`ALTER TABLE \`lab_order\` DROP FOREIGN KEY \`FK_261e3a5af0cb1a997a68427c26f\``);
        await queryRunner.query(`ALTER TABLE \`lab_order\` DROP FOREIGN KEY \`FK_ae79597e5e8038d403463944897\``);
        await queryRunner.query(`ALTER TABLE \`medical_profiles\` DROP FOREIGN KEY \`FK_3c17255bdf60f4cdba6704e1a5a\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_27d877978f71f346a3c92c49836\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_3b1546f4a372400ada63bdc1287\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_b53c9d9d9741bac9726574f34f7\``);
        await queryRunner.query(`ALTER TABLE \`patients\` DROP FOREIGN KEY \`FK_7fe1518dc780fd777669b5cb7a0\``);
        await queryRunner.query(`ALTER TABLE \`pharmacy_order\` DROP FOREIGN KEY \`FK_b963c9da6056baa605e3bdf9983\``);
        await queryRunner.query(`ALTER TABLE \`pharmacy_order\` DROP FOREIGN KEY \`FK_fe301667e65f4d6e16169455349\``);
        await queryRunner.query(`ALTER TABLE \`pharmacy_order_item\` DROP FOREIGN KEY \`FK_3e83c7888039a8a32560ef6ba21\``);
        await queryRunner.query(`ALTER TABLE \`pharmacy_order_item\` DROP FOREIGN KEY \`FK_1038c3ddd5551c043a5134079e7\``);
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP FOREIGN KEY \`FK_d9d1ecabc97e4de5c07a1795279\``);
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP FOREIGN KEY \`FK_3e4a39a72939d42f31039f25ae6\``);
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP FOREIGN KEY \`FK_432108890b812a8a65eb964741e\``);
        await queryRunner.query(`ALTER TABLE \`prescription_item\` DROP FOREIGN KEY \`FK_5d07e939f61a43c29fc84263e15\``);
        await queryRunner.query(`ALTER TABLE \`prescription_item\` DROP FOREIGN KEY \`FK_0296aeae85365a980036bb7af48\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_45a6cefc24d5af16842be69a65a\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_c954aa19f3f500fc180000577ac\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_e28a8c7515d12f28a1fb8022c12\``);
        await queryRunner.query(`ALTER TABLE \`appointment\` DROP FOREIGN KEY \`FK_cee8b55c31f700609674da96b0b\``);
        await queryRunner.query(`ALTER TABLE \`appointment\` DROP FOREIGN KEY \`FK_514bcc3fb1b8140f85bf1cde6e2\``);
        await queryRunner.query(`ALTER TABLE \`appointment\` DROP FOREIGN KEY \`FK_5ce4c3130796367c93cd817948e\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_150d4d66fbf46ada8965e14294f\``);
        await queryRunner.query(`ALTER TABLE \`invoice_item\` DROP FOREIGN KEY \`FK_553d5aac210d22fdca5c8d48ead\``);
        await queryRunner.query(`ALTER TABLE \`doctor_licences\` DROP FOREIGN KEY \`FK_f397d334519b0656d74d27a474d\``);
        await queryRunner.query(`ALTER TABLE \`doctor_schedules\` DROP FOREIGN KEY \`FK_a9562c0e3b99e62425d3356c88b\``);
        await queryRunner.query(`ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_92558c08091598f7a4439586cda\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NULL ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`reg_code\` \`reg_code\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP INDEX \`IDX_62069f52ebba471c91de5d59d6\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`email\` \`email\` varchar(40) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`national_id\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`national_id\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`sex\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`sex\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`dob\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`dob\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`national_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`national_id\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`mobile\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`mobile\` varchar(40) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lname\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lname\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`fname\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`fname\` varchar(40) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`onboarding_completed\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`accepted_terms\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`lastAccess\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`can_prescribe\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`resetTokenExpiry\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`resetToken\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`otp_expires\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`otp\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`stampUrl\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`signatureUrl\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`profile_image\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`featured\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`regulatory_body\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`residance\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`licenceExpiry\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`max_serial\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`serial_day\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`serial_or_slot\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`latitude\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`slot_type\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`rejectionReason\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`approvalStatus\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_access\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deletionScheduledAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deletionRequestedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isPublic\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`bio\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`specialization\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`licenseNumber\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otp_expires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otp\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetTokenExpires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetToken\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationToken\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`googleId\``);
        await queryRunner.query(`DROP INDEX \`IDX_f89a875fe1236e2cbf4d729c32\` ON \`doctor_specialities\``);
        await queryRunner.query(`DROP INDEX \`IDX_75b6ea0a12b0a3c394b0f24060\` ON \`doctor_specialities\``);
        await queryRunner.query(`DROP TABLE \`doctor_specialities\``);
        await queryRunner.query(`DROP INDEX \`IDX_32fe00e126065ab738f0b1113a\` ON \`ambulance_packages\``);
        await queryRunner.query(`DROP TABLE \`ambulance_packages\``);
        await queryRunner.query(`DROP TABLE \`ambulance_subscriptions\``);
        await queryRunner.query(`DROP TABLE \`departments\``);
        await queryRunner.query(`DROP TABLE \`emergency_alerts\``);
        await queryRunner.query(`DROP INDEX \`IDX_894f3521047f139001c93e0d61\` ON \`payment_config\``);
        await queryRunner.query(`DROP TABLE \`payment_config\``);
        await queryRunner.query(`DROP TABLE \`service_price\``);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`DROP TABLE \`lab_result\``);
        await queryRunner.query(`DROP TABLE \`lab_order\``);
        await queryRunner.query(`DROP TABLE \`lab_test\``);
        await queryRunner.query(`DROP TABLE \`locations\``);
        await queryRunner.query(`DROP INDEX \`REL_3c17255bdf60f4cdba6704e1a5\` ON \`medical_profiles\``);
        await queryRunner.query(`DROP TABLE \`medical_profiles\``);
        await queryRunner.query(`DROP TABLE \`medical_record\``);
        await queryRunner.query(`DROP TABLE \`mpesa_transaction\``);
        await queryRunner.query(`DROP TABLE \`communication_logs\``);
        await queryRunner.query(`DROP INDEX \`REL_7fe1518dc780fd777669b5cb7a\` ON \`patients\``);
        await queryRunner.query(`DROP TABLE \`patients\``);
        await queryRunner.query(`DROP TABLE \`pharmacy_order\``);
        await queryRunner.query(`DROP TABLE \`pharmacy_order_item\``);
        await queryRunner.query(`DROP TABLE \`prescription\``);
        await queryRunner.query(`DROP TABLE \`prescription_item\``);
        await queryRunner.query(`DROP TABLE \`medication\``);
        await queryRunner.query(`DROP INDEX \`REL_45a6cefc24d5af16842be69a65\` ON \`reviews\``);
        await queryRunner.query(`DROP TABLE \`reviews\``);
        await queryRunner.query(`DROP TABLE \`appointment\``);
        await queryRunner.query(`DROP TABLE \`invoice\``);
        await queryRunner.query(`DROP TABLE \`invoice_item\``);
        await queryRunner.query(`DROP TABLE \`services\``);
        await queryRunner.query(`DROP TABLE \`specialities\``);
        await queryRunner.query(`DROP TABLE \`doctor_licences\``);
        await queryRunner.query(`DROP TABLE \`doctor_schedules\``);
        await queryRunner.query(`DROP TABLE \`support_requests\``);
        await queryRunner.query(`DROP TABLE \`system_setting\``);
        await queryRunner.query(`DROP TABLE \`wallets\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_doctor_email\` ON \`doctors\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_email\` ON \`users\` (\`email\`)`);
    }

}
