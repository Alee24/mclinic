-- M-Clinic Core Database Schema
-- Generated for manual import via phpMyAdmin

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('patient','doctor','admin','lab_tech','nurse','clinician','medic','finance','pharmacist') NOT NULL DEFAULT 'patient',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `emailVerifiedAt` timestamp NULL DEFAULT NULL,
  `fname` varchar(40) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `mobile` varchar(40) DEFAULT NULL,
  `national_id` varchar(20) DEFAULT NULL,
  `dob` varchar(20) DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(10,8) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `doctors`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `fname` varchar(40) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `mobile` varchar(40) DEFAULT NULL,
  `national_id` varchar(20) DEFAULT NULL,
  `dob` varchar(20) DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `reg_code` varchar(50) NOT NULL,
  `licenceNo` varchar(20) DEFAULT NULL,
  `Verified_status` tinyint(4) NOT NULL DEFAULT '0',
  `approved_status` varchar(50) NOT NULL DEFAULT 'Pending',
  `balance` decimal(28,2) NOT NULL DEFAULT '0.00',
  `dr_type` varchar(50) NOT NULL DEFAULT 'Nurse',
  `qualification` varchar(255) DEFAULT NULL,
  `speciality` varchar(255) DEFAULT NULL,
  `about` text,
  `fee` int(11) NOT NULL DEFAULT '1500',
  `start_time` varchar(40) DEFAULT NULL,
  `end_time` varchar(40) DEFAULT NULL,
  `duration` int(11) NOT NULL DEFAULT '0',
  `department_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `years_of_experience` int(11) NOT NULL DEFAULT '0',
  `hospital_attachment` varchar(150) DEFAULT NULL,
  `telemedicine` tinyint(4) NOT NULL DEFAULT '0',
  `on_call` tinyint(4) NOT NULL DEFAULT '0',
  `is_online` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_doctor_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Data for table `users`
-- --------------------------------------------------------

-- Insert Admin User (Password: Digital2025)
INSERT INTO `users` (`email`, `password`, `role`, `status`, `fname`, `lname`, `createdAt`, `updatedAt`)
VALUES
('mettoalex@gmail.com', '$2b$10$wE3/M6k/x.e.d.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z', 'admin', 1, 'Admin', 'User', NOW(), NOW());
-- NOTE: You MUST regenerate the password hash if this one doesn't work.
-- Use the reset-password utility or login via existing method if possible.

SET FOREIGN_KEY_CHECKS = 1;
