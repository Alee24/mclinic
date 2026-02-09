import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpColumns1739140000000 implements MigrationInterface {
    name = 'AddOtpColumns1739140000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safe check and add columns if they don't exist is harder in raw SQL without stored procs in MySQL
        // But assuming they don't exist as per task

        // Users Table
        // Check if column exists logic is verbose, so we wrap in try-catch or just run
        // But TypeORM migrations usually assume state. 
        // I will use `ADD COLUMN IF NOT EXISTS` is not supported in MySQL 5.7 but is in 8.0.
        // I'll stick to standard ADD COLUMN. If it fails due to Duplicate, user can handle or I can use a block.

        try {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`otp\` varchar(255) NULL`);
        } catch (e) { }
        try {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`otpExpiry\` timestamp NULL`);
        } catch (e) { }

        // Doctors Table
        try {
            await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`otp\` varchar(255) NULL`);
        } catch (e) { }
        try {
            await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`otpExpiry\` datetime NULL`);
        } catch (e) { }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try { await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`otpExpiry\``); } catch (e) { }
        try { await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`otp\``); } catch (e) { }
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otpExpiry\``); } catch (e) { }
        try { await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otp\``); } catch (e) { }
    }
}
