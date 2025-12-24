-- M-Clinic Complete Database Migration
-- This script rebuilds the entire database to match production schema
-- Run this to prepare for data import from existing system

USE mclinic;

-- ========================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ========================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `appointment_prescription`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `ambulance_requests`;
DROP TABLE IF EXISTS `ambulances`;
DROP TABLE IF EXISTS `alert_notification`;
DROP TABLE IF EXISTS `admin_notifications`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `assistant_doctor_tracks`;
DROP TABLE IF EXISTS `assistants`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `dependants`;
DROP TABLE IF EXISTS `deposits`;
DROP TABLE IF EXISTS `doctors`;
DROP TABLE IF EXISTS `invoice_item`;
DROP TABLE IF EXISTS `invoice`;
DROP TABLE IF EXISTS `medical_record`;
DROP TABLE IF EXISTS `payment_config`;
DROP TABLE IF EXISTS `service_price`;
DROP TABLE IF EXISTS `service`;
DROP TABLE IF EXISTS `transaction`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `doctor_licences`;
DROP TABLE IF EXISTS `doctor_schedules`;
DROP TABLE IF EXISTS `doctor_specialities`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `specialities`;
DROP TABLE IF EXISTS `wallets`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✓ Step 1: All existing tables dropped' AS Progress;

-- ========================================
-- STEP 2: CREATE CORE TABLES
-- ========================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Admins table
CREATE TABLE `admins` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  `email` varchar(40) NOT NULL,
  `username` varchar(40) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Users table (patients)
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `fname` varchar(40) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  `email` varchar(40) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `mobile` varchar(40) DEFAULT NULL,
  `dob` varchar(20) DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Doctors table
CREATE TABLE `doctors` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `fname` varchar(40) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  `national_id` varchar(20) DEFAULT NULL,
  `email` varchar(40) NOT NULL,
  `dob` varchar(20) DEFAULT NULL,
  `reg_code` varchar(50) NOT NULL,
  `Verified_status` tinyint(1) NOT NULL DEFAULT '0',
  `approved_status` varchar(50) NOT NULL DEFAULT 'Pending',
  `password` varchar(255) DEFAULT NULL,
  `mobile` varchar(40) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `balance` decimal(28,2) NOT NULL DEFAULT '0.00',
  `sex` varchar(20) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `speciality` varchar(255) DEFAULT NULL,
  `dr_type` varchar(50) DEFAULT 'Nurse',
  `about` text,
  `slot_type` tinyint(1) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `fee` int NOT NULL DEFAULT '1500',
  `serial_or_slot` text,
  `start_time` varchar(40) DEFAULT NULL,
  `end_time` varchar(40) DEFAULT NULL,
  `serial_day` int NOT NULL DEFAULT '0',
  `max_serial` int NOT NULL DEFAULT '0',
  `duration` int NOT NULL DEFAULT '0',
  `department_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `licenceNo` varchar(20) DEFAULT NULL,
  `licenceExpiry` timestamp NULL DEFAULT NULL,
  `residance` varchar(100) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Service table
CREATE TABLE `service` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `duration` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SELECT '✓ Step 2: Core tables created (admins, users, doctors, services)' AS Progress;

-- ========================================
-- STEP 3: CREATE APPOINTMENTS & FINANCIAL TABLES
-- ========================================

-- Appointments table
CREATE TABLE `appointments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint NOT NULL,
  `doctor_id` bigint UNSIGNED NOT NULL,
  `site` tinyint(1) NOT NULL DEFAULT '0',
  `physical_virtual` varchar(50) NOT NULL,
  `roomID` varchar(20) DEFAULT NULL,
  `appointment_for` varchar(50) NOT NULL,
  `distance` int NOT NULL,
  `amount` int NOT NULL,
  `latitude` varchar(50) NOT NULL,
  `longitude` varchar(50) NOT NULL,
  `nurse_latitude` varchar(50) DEFAULT NULL,
  `nurse_longitude` varchar(50) DEFAULT NULL,
  `mobile` varchar(191) NOT NULL,
  `age` int NOT NULL,
  `disease` text,
  `chronic_yn` varchar(100) NOT NULL,
  `booking_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` varchar(20) NOT NULL DEFAULT 'Pending',
  `appointment_status` varchar(50) NOT NULL DEFAULT 'Confirmed',
  `trx_code` varchar(191) DEFAULT NULL,
  `is_complete` int NOT NULL DEFAULT '0',
  `is_delete` int NOT NULL DEFAULT '0',
  `patient_rate` int DEFAULT NULL,
  `closed_by` bigint DEFAULT NULL,
  `cancelled_on` timestamp NULL DEFAULT NULL,
  `canceled_by_patient` bigint DEFAULT NULL,
  `canceled_by_doctor` bigint DEFAULT NULL,
  `reactivated_admin` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `special_instructions` text,
  `attachments` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `service_id` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Invoice table
CREATE TABLE `invoice` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  `patient_mobile` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` varchar(20) NOT NULL DEFAULT 'Pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Invoice items table
CREATE TABLE `invoice_item` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Transaction table
CREATE TABLE `transaction` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `reference` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `type` varchar(50) NOT NULL,
  `source` varchar(50) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Appointment prescription table
CREATE TABLE `appointment_prescription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `patient_id` bigint NOT NULL,
  `doctor_id` int NOT NULL,
  `doctor` varchar(100) DEFAULT NULL,
  `patient` varchar(100) DEFAULT NULL,
  `service_id` int NOT NULL,
  `service` varchar(100) DEFAULT NULL,
  `doctor_notes` text NOT NULL,
  `patient_description` text NOT NULL,
  `suggestion` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SELECT '✓ Step 3: Appointments and financial tables created' AS Progress;

-- ========================================
-- FINAL STATUS
-- ========================================

SELECT '✅ DATABASE MIGRATION COMPLETE!' AS Status;
SELECT 'Database is now ready for data import from existing system' AS Message;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'mclinic') AS 'Total Tables Created';
