import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToAppointments1779075000000 implements MigrationInterface {
    name = 'AddLocationToAppointments1779075000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use IF NOT EXISTS for safety with MySQL syntax
        const tableHasLatitude = await queryRunner.query(`
            SELECT count(*) AS count
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'appointment'
            AND COLUMN_NAME = 'latitude'
        `);
        
        if (Number(tableHasLatitude[0].count) === 0) {
            await queryRunner.query(`ALTER TABLE \`appointment\` ADD \`latitude\` decimal(10,6) NULL`);
            await queryRunner.query(`ALTER TABLE \`appointment\` ADD \`longitude\` decimal(10,6) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appointment\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`appointment\` DROP COLUMN \`latitude\``);
    }
}
