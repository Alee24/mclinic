import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorOnboardingFields1777105825484 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`accepted_terms\` TINYINT DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`onboarding_completed\` TINYINT DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`accepted_terms\``);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`onboarding_completed\``);
    }

}
