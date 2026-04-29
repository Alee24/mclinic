import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommissionToAmbulancePackages1772225678901 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ambulance_packages\` ADD COLUMN IF NOT EXISTS \`commission\` decimal(10,2) NOT NULL DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE \`ambulance_packages\` ADD COLUMN IF NOT EXISTS \`is_group_package\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`ambulance_packages\` ADD COLUMN IF NOT EXISTS \`min_members\` int NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ambulance_packages\` DROP COLUMN \`commission\``);
        await queryRunner.query(`ALTER TABLE \`ambulance_packages\` DROP COLUMN \`is_group_package\``);
        await queryRunner.query(`ALTER TABLE \`ambulance_packages\` DROP COLUMN \`min_members\``);
    }

}
