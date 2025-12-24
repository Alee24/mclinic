-- M-Clinic Database Schema Migration
-- This script rebuilds the database to match the existing production system
-- Making data migration seamless

USE mclinic;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing tables
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

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All tables dropped successfully!' AS Status;
