import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsVirtualToAppointments1742800320000 implements MigrationInterface {
    name = 'AddIsVirtualToAppointments1742800320000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("appointment");
        const hasColumn = table?.findColumnByName("isVirtual");
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE \`appointment\` ADD \`isVirtual\` tinyint NOT NULL DEFAULT 0`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appointment\` DROP COLUMN \`isVirtual\``);
    }

}
