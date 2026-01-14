-- M-Clinic Complete Database Schema
-- Generated from Prisma Schema
-- Import this file via phpMyAdmin to create all tables
-- Database: mclinicportal

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('patient', 'doctor', 'admin', 'lab_tech', 'nurse', 'clinician', 'medic', 'finance', 'pharmacist') NOT NULL DEFAULT 'patient',
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `emailVerifiedAt` TIMESTAMP NULL DEFAULT NULL,
  `fname` VARCHAR(40) NULL,
  `lname` VARCHAR(50) NULL,
  `mobile` VARCHAR(40) NULL,
  `national_id` VARCHAR(255) NULL,
  `dob` VARCHAR(20) NULL,
  `sex` VARCHAR(20) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(10, 8) NULL,
  `profile_image` VARCHAR(255) NULL,
  `resetToken` VARCHAR(255) NULL,
  `resetTokenExpiry` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: patients
CREATE TABLE IF NOT EXISTS `patients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `fname` VARCHAR(40) NULL,
  `lname` VARCHAR(50) NULL,
  `mobile` VARCHAR(40) NULL,
  `dob` VARCHAR(20) NULL,
  `sex` VARCHAR(20) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(10, 8) NULL,
  `blood_group` VARCHAR(10) NULL,
  `genotype` VARCHAR(10) NULL,
  `height` DECIMAL(5, 2) NULL,
  `weight` DECIMAL(5, 2) NULL,
  `allergies` TEXT NULL,
  `medical_history` TEXT NULL,
  `family_history` TEXT NULL,
  `social_history` TEXT NULL,
  `emergency_contact_name` VARCHAR(100) NULL,
  `emergency_contact_phone` VARCHAR(255) NULL,
  `emergency_contact_relation` VARCHAR(40) NULL,
  `insurance_provider` VARCHAR(100) NULL,
  `insurance_policy_no` VARCHAR(255) NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: medical_profiles
CREATE TABLE IF NOT EXISTS `medical_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `blood_group` VARCHAR(10) NULL,
  `genotype` VARCHAR(10) NULL,
  `height` FLOAT NULL,
  `weight` FLOAT NULL,
  `allergies` TEXT NULL,
  `medical_history` TEXT NULL,
  `social_history` TEXT NULL,
  `family_history` TEXT NULL,
  `emergency_contact_name` VARCHAR(100) NULL,
  `emergency_contact_phone` VARCHAR(255) NULL,
  `emergency_contact_relation` VARCHAR(40) NULL,
  `insurance_provider` VARCHAR(100) NULL,
  `insurance_policy_no` VARCHAR(255) NULL,
  `shif_number` VARCHAR(255) NULL,
  `subscription_plan` VARCHAR(50) NOT NULL DEFAULT 'Pay-As-You-Go',
  `current_medications` TEXT NULL,
  `surgical_history` TEXT NULL,
  `disability_status` TEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: doctors
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `fname` VARCHAR(40) NULL,
  `lname` VARCHAR(50) NULL,
  `username` VARCHAR(40) NULL,
  `email` VARCHAR(40) NULL,
  `password` VARCHAR(255) NULL,
  `mobile` VARCHAR(40) NULL,
  `national_id` VARCHAR(255) NULL,
  `dob` VARCHAR(20) NULL,
  `sex` VARCHAR(20) NULL,
  `address` VARCHAR(255) NULL,
  `reg_code` VARCHAR(50) NULL,
  `licenceNo` VARCHAR(20) NULL,
  `Verified_status` TINYINT NOT NULL DEFAULT 0,
  `approved_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `balance` DECIMAL(28, 2) NOT NULL DEFAULT 0.00,
  `dr_type` VARCHAR(50) NOT NULL DEFAULT 'Nurse',
  `qualification` VARCHAR(255) NULL,
  `speciality` VARCHAR(255) NULL,
  `about` TEXT NULL,
  `fee` INT NOT NULL DEFAULT 1500,
  `start_time` VARCHAR(40) NULL,
  `end_time` VARCHAR(40) NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `department_id` INT NULL,
  `location_id` INT NULL,
  `years_of_experience` INT NOT NULL DEFAULT 0,
  `hospital_attachment` VARCHAR(150) NULL,
  `telemedicine` TINYINT NOT NULL DEFAULT 0,
  `on_call` TINYINT NOT NULL DEFAULT 0,
  `is_online` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: doctor_schedules
CREATE TABLE IF NOT EXISTS `doctor_schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_id` BIGINT UNSIGNED NOT NULL,
  `slot_type` TINYINT NULL,
  `start_time` VARCHAR(40) NULL,
  `end_time` VARCHAR(40) NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `max_serial` INT NOT NULL DEFAULT 0,
  `serial_day` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: doctor_licences
CREATE TABLE IF NOT EXISTS `doctor_licences` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_id` BIGINT UNSIGNED NOT NULL,
  `licence_no` VARCHAR(20) NULL,
  `expiry_date` TIMESTAMP NULL DEFAULT NULL,
  `document` VARCHAR(255) NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CORE MEDICAL TABLES
-- ============================================================================

-- Table: appointment
CREATE TABLE IF NOT EXISTS `appointment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patientId` BIGINT UNSIGNED NOT NULL,
  `doctorId` BIGINT UNSIGNED NOT NULL,
  `serviceId` INT NULL,
  `appointment_date` DATE NULL,
  `appointment_time` VARCHAR(40) NULL,
  `fee` INT NOT NULL DEFAULT 0,
  `transportFee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `notes` VARCHAR(255) NULL,
  `meetingLink` VARCHAR(255) NULL,
  `meetingId` VARCHAR(255) NULL,
  `reason` TEXT NULL,
  `isForSelf` TINYINT(1) NOT NULL DEFAULT 1,
  `beneficiaryName` VARCHAR(255) NULL,
  `beneficiaryGender` VARCHAR(255) NULL,
  `beneficiaryAge` VARCHAR(255) NULL,
  `beneficiaryRelation` VARCHAR(255) NULL,
  `activeMedications` TEXT NULL,
  `currentPrescriptions` TEXT NULL,
  `homeAddress` VARCHAR(255) NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: medical_record
CREATE TABLE IF NOT EXISTS `medical_record` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patientId` BIGINT UNSIGNED NOT NULL,
  `doctorId` BIGINT UNSIGNED NOT NULL,
  `appointmentId` INT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `prescription` TEXT NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rating` INT NOT NULL,
  `comment` VARCHAR(255) NULL,
  `appointmentId` INT NULL,
  `patientId` BIGINT UNSIGNED NOT NULL,
  `doctorId` BIGINT UNSIGNED NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointmentId` (`appointmentId`),
  FOREIGN KEY (`appointmentId`) REFERENCES `appointment`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FINANCIAL TABLES
-- ============================================================================

-- Table: wallets
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `balance` DECIMAL(28, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'KES',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: transaction
CREATE TABLE IF NOT EXISTS `transaction` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(255) NULL,
  `amount` DECIMAL(28, 2) NOT NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'debit',
  `source` VARCHAR(255) NOT NULL DEFAULT 'MPESA',
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `userId` BIGINT UNSIGNED NULL,
  `invoiceId` INT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: mpesa_transaction
CREATE TABLE IF NOT EXISTS `mpesa_transaction` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `merchantRequestId` VARCHAR(255) NOT NULL,
  `checkoutRequestId` VARCHAR(255) NOT NULL,
  `phoneNumber` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `accountReference` VARCHAR(255) NULL,
  `transactionDesc` VARCHAR(255) NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `resultCode` VARCHAR(255) NULL,
  `resultDesc` VARCHAR(255) NULL,
  `mpesaReceiptNumber` VARCHAR(255) NULL,
  `transactionDate` DATETIME NULL,
  `relatedEntity` VARCHAR(255) NULL,
  `relatedEntityId` INT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: payment_config
CREATE TABLE IF NOT EXISTS `payment_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider` VARCHAR(255) NOT NULL,
  `credentials` TEXT NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'KES',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: invoice
CREATE TABLE IF NOT EXISTS `invoice` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoiceNumber` VARCHAR(255) NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerEmail` VARCHAR(255) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `dueDate` DATE NULL,
  `customerMobile` VARCHAR(255) NULL,
  `paymentMethod` VARCHAR(255) NULL,
  `doctorId` BIGINT UNSIGNED NULL,
  `commissionAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `appointmentId` INT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: invoice_item
CREATE TABLE IF NOT EXISTS `invoice_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `unitPrice` DECIMAL(10, 2) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `invoiceId` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SERVICES & LOCATIONS TABLES
-- ============================================================================

-- Table: locations
CREATE TABLE IF NOT EXISTS `locations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  `address` VARCHAR(255) NULL,
  `latitude` DECIMAL(10, 6) NULL,
  `longitude` DECIMAL(10, 6) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: services
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: specialities
CREATE TABLE IF NOT EXISTS `specialities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: departments
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHARMACY TABLES
-- ============================================================================

-- Table: medication
CREATE TABLE IF NOT EXISTS `medication` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(255) NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `image_url` VARCHAR(255) NULL,
  `brandName` VARCHAR(255) NULL,
  `genericName` VARCHAR(255) NULL,
  `strength` VARCHAR(255) NULL,
  `formulation` VARCHAR(255) NULL,
  `requiresPrescription` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: prescription
CREATE TABLE IF NOT EXISTS `prescription` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `appointmentId` INT NULL,
  `doctorId` BIGINT UNSIGNED NOT NULL,
  `patientId` BIGINT UNSIGNED NOT NULL,
  `doctorSignatureUrl` VARCHAR(255) NULL,
  `doctorStampUrl` VARCHAR(255) NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `validUntil` DATETIME NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: prescription_item
CREATE TABLE IF NOT EXISTS `prescription_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `prescriptionId` INT NOT NULL,
  `medicationId` INT NOT NULL,
  `medicationName` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(255) NOT NULL,
  `frequency` VARCHAR(255) NULL,
  `duration` VARCHAR(255) NULL,
  `quantity` INT NOT NULL,
  `instructions` TEXT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`prescriptionId`) REFERENCES `prescription`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: pharmacy_order
CREATE TABLE IF NOT EXISTS `pharmacy_order` (
  `id` VARCHAR(36) NOT NULL,
  `userId` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `deliveryAddress` VARCHAR(255) NULL,
  `deliveryCity` VARCHAR(255) NULL,
  `contactPhone` VARCHAR(255) NULL,
  `paymentMethod` VARCHAR(255) NOT NULL DEFAULT 'CASH',
  `paymentStatus` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `transactionId` VARCHAR(255) NULL,
  `prescriptionId` VARCHAR(255) NULL,
  `invoiceId` INT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: pharmacy_order_item
CREATE TABLE IF NOT EXISTS `pharmacy_order_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` VARCHAR(36) NOT NULL,
  `medicationId` INT NOT NULL,
  `medicationName` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `pharmacy_order`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- LABORATORY TABLES
-- ============================================================================

-- Table: lab_test
CREATE TABLE IF NOT EXISTS `lab_test` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(255) NOT NULL DEFAULT 'Other',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lab_order
CREATE TABLE IF NOT EXISTS `lab_order` (
  `id` VARCHAR(36) NOT NULL,
  `patient_id` BIGINT UNSIGNED NULL,
  `test_id` INT NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `sample_collection_date` DATETIME NULL,
  `isForSelf` TINYINT(1) NOT NULL DEFAULT 1,
  `beneficiaryName` VARCHAR(255) NULL,
  `beneficiaryAge` VARCHAR(255) NULL,
  `beneficiaryGender` VARCHAR(255) NULL,
  `beneficiaryRelation` VARCHAR(255) NULL,
  `report_url` VARCHAR(255) NULL,
  `technicianNotes` TEXT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lab_result
CREATE TABLE IF NOT EXISTS `lab_result` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(36) NOT NULL,
  `parameter_name` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `unit` VARCHAR(255) NULL,
  `reference_range` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `is_abnormal` TINYINT(1) NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `lab_order`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AMBULANCE TABLES
-- ============================================================================

-- Table: ambulance_packages
CREATE TABLE IF NOT EXISTS `ambulance_packages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `validity_days` INT NOT NULL DEFAULT 365,
  `features` JSON NULL,
  `max_adults` INT NOT NULL DEFAULT 0,
  `max_children` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: ambulance_subscriptions
CREATE TABLE IF NOT EXISTS `ambulance_subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `primary_subscriber_name` VARCHAR(255) NOT NULL,
  `dob` DATE NULL,
  `gender` VARCHAR(20) NULL,
  `identification_number` VARCHAR(50) NULL,
  `nationality` VARCHAR(50) NULL,
  `language_spoken` VARCHAR(50) NULL,
  `photo_url` VARCHAR(255) NULL,
  `primary_phone` VARCHAR(20) NOT NULL,
  `secondary_phone` VARCHAR(20) NULL,
  `email` VARCHAR(255) NULL,
  `residential_address` VARCHAR(255) NULL,
  `county` VARCHAR(255) NULL,
  `estate` VARCHAR(255) NULL,
  `street` VARCHAR(255) NULL,
  `house_details` VARCHAR(255) NULL,
  `landmark` VARCHAR(255) NULL,
  `gps_coordinates` TEXT NULL,
  `work_address` VARCHAR(255) NULL,
  `blood_type` VARCHAR(10) NULL,
  `allergies` TEXT NULL,
  `chronic_conditions` TEXT NULL,
  `current_medications` TEXT NULL,
  `surgical_history` TEXT NULL,
  `disabilities` TEXT NULL,
  `pregnancy_status` VARCHAR(255) NULL,
  `preferred_hospital` VARCHAR(255) NULL,
  `insurance_details` VARCHAR(255) NULL,
  `package_type` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `family_members` JSON NULL,
  `emergency_contacts` JSON NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SETTINGS TABLE
-- ============================================================================

-- Table: system_setting
CREATE TABLE IF NOT EXISTS `system_setting` (
  `key` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `isSecure` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ All tables created successfully!' AS Status;
SELECT 'Database: mclinicportal is ready to use' AS Message;
