import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeLicenceNoToText1778697000000 implements MigrationInterface {
    name = 'ChangeLicenceNoToText1778697000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('[MIGRATION] Changing licenceNo to TEXT for maximum capacity...');
        
        // 1. Update doctors table
        try {
            await queryRunner.query(`ALTER TABLE \`doctors\` MODIFY \`licenceNo\` TEXT NULL`);
            console.log('[MIGRATION] Successfully changed doctors.licenceNo to TEXT');
        } catch (e) {
            console.warn('[MIGRATION] Failed to modify doctors.licenceNo using MODIFY, trying CHANGE...', e.message);
            try {
                await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`licenceNo\` \`licenceNo\` TEXT NULL`);
            } catch (e2) {
                console.error('[MIGRATION] CRITICAL: Could not change doctors.licenceNo to TEXT:', e2.message);
            }
        }

        // 2. Update doctor_licences table
        try {
            await queryRunner.query(`ALTER TABLE \`doctor_licences\` MODIFY \`licence_no\` TEXT NULL`);
            console.log('[MIGRATION] Successfully changed doctor_licences.licence_no to TEXT');
        } catch (e) {
            console.warn('[MIGRATION] Failed to modify doctor_licences.licence_no using MODIFY, trying CHANGE...', e.message);
            try {
                await queryRunner.query(`ALTER TABLE \`doctor_licences\` CHANGE \`licence_no\` \`licence_no\` TEXT NULL`);
            } catch (e2) {
                console.error('[MIGRATION] CRITICAL: Could not change doctor_licences.licence_no to TEXT:', e2.message);
            }
        }
        // 3. Update users table
        try {
            await queryRunner.query(`ALTER TABLE \`users\` MODIFY \`licenseNumber\` TEXT NULL`);
            await queryRunner.query(`ALTER TABLE \`users\` MODIFY \`specialization\` TEXT NULL`);
            console.log('[MIGRATION] Successfully changed users encrypted fields to TEXT');
        } catch (e) {
            console.warn('[MIGRATION] Failed to modify users fields using MODIFY, trying CHANGE...', e.message);
            try {
                await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`licenseNumber\` \`licenseNumber\` TEXT NULL`);
                await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`specialization\` \`specialization\` TEXT NULL`);
            } catch (e2) {
                console.error('[MIGRATION] CRITICAL: Could not change users fields to TEXT:', e2.message);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration
    }
}
