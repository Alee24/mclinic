import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLicenceNoLength1778696000000 implements MigrationInterface {
    name = 'FixLicenceNoLength1778696000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('[MIGRATION] Fixing licenceNo and licence_no lengths definitively...');
        
        // 1. Update doctors table
        try {
            await queryRunner.query(`ALTER TABLE \`doctors\` MODIFY \`licenceNo\` VARCHAR(255) NULL`);
            console.log('[MIGRATION] Successfully modified doctors.licenceNo to VARCHAR(255)');
        } catch (e) {
            console.warn('[MIGRATION] Failed to modify doctors.licenceNo using MODIFY, trying CHANGE...', e.message);
            try {
                await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`licenceNo\` \`licenceNo\` VARCHAR(255) NULL`);
            } catch (e2) {
                console.error('[MIGRATION] CRITICAL: Could not update doctors.licenceNo length:', e2.message);
            }
        }

        // 2. Update doctor_licences table
        try {
            await queryRunner.query(`ALTER TABLE \`doctor_licences\` MODIFY \`licence_no\` VARCHAR(255) NULL`);
            console.log('[MIGRATION] Successfully modified doctor_licences.licence_no to VARCHAR(255)');
        } catch (e) {
            console.warn('[MIGRATION] Failed to modify doctor_licences.licence_no using MODIFY, trying CHANGE...', e.message);
            try {
                await queryRunner.query(`ALTER TABLE \`doctor_licences\` CHANGE \`licence_no\` \`licence_no\` VARCHAR(255) NULL`);
            } catch (e2) {
                console.error('[MIGRATION] CRITICAL: Could not update doctor_licences.licence_no length:', e2.message);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration
    }
}
