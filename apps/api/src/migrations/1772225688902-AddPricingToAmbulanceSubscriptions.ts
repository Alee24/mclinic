import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPricingToAmbulanceSubscriptions1772225688902 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` ADD COLUMN IF NOT EXISTS \`price\` decimal(10,2) NOT NULL DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` ADD COLUMN IF NOT EXISTS \`commission\` decimal(10,2) NOT NULL DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` ADD COLUMN IF NOT EXISTS \`total_amount\` decimal(10,2) NOT NULL DEFAULT 0.00`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP COLUMN \`price\``);
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP COLUMN \`commission\``);
        await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP COLUMN \`total_amount\``);
    }

}
