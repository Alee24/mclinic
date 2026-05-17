import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationCodeToPrescription1779015300000 implements MigrationInterface {
    name = 'AddVerificationCodeToPrescription1779015300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('[MIGRATION] Adding verificationCode column to prescription table...');
        
        try {
            await queryRunner.query(`ALTER TABLE \`prescription\` ADD \`verificationCode\` VARCHAR(255) NULL`);
            console.log('[MIGRATION] Successfully added prescription.verificationCode');
        } catch (e) {
            console.warn('[MIGRATION] prescription.verificationCode may already exist:', e.message);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE \`prescription\` DROP COLUMN \`verificationCode\``);
            console.log('[MIGRATION] Successfully dropped prescription.verificationCode');
        } catch (e) {
            console.error('[MIGRATION] Failed to drop prescription.verificationCode:', e.message);
        }
    }
}
