import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddConciergeFieldsToAppointment1777855000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Make doctorId nullable
        await queryRunner.query(`ALTER TABLE \`appointment\` MODIFY COLUMN \`doctorId\` BIGINT UNSIGNED NULL`);

        const table = await queryRunner.getTable("appointment");
        if (!table) return;

        // 2. Add Concierge fields safely
        if (!table.findColumnByName("conciergeType")) {
            await queryRunner.addColumn("appointment", new TableColumn({
                name: "conciergeType",
                type: "varchar",
                isNullable: true,
                length: "255"
            }));
        }

        if (!table.findColumnByName("durationHours")) {
            await queryRunner.addColumn("appointment", new TableColumn({
                name: "durationHours",
                type: "int",
                default: 6,
                isNullable: false
            }));
        }

        if (!table.findColumnByName("isConcierge")) {
            await queryRunner.addColumn("appointment", new TableColumn({
                name: "isConcierge",
                type: "tinyint",
                default: 0,
                isNullable: false
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert fields safely
        const table = await queryRunner.getTable("appointment");
        if (table) {
            if (table.findColumnByName("isConcierge")) await queryRunner.dropColumn("appointment", "isConcierge");
            if (table.findColumnByName("durationHours")) await queryRunner.dropColumn("appointment", "durationHours");
            if (table.findColumnByName("conciergeType")) await queryRunner.dropColumn("appointment", "conciergeType");
        }

        // Revert doctorId to NOT NULL (careful if there are null values)
        await queryRunner.query(`ALTER TABLE \`appointment\` MODIFY COLUMN \`doctorId\` BIGINT UNSIGNED NOT NULL`);
    }

}
