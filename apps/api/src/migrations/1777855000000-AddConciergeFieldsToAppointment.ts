import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddConciergeFieldsToAppointment1777855000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Make doctorId nullable
        await queryRunner.query(`ALTER TABLE \`appointment\` MODIFY COLUMN \`doctorId\` BIGINT UNSIGNED NULL`);

        // 2. Add Concierge fields
        await queryRunner.addColumn("appointment", new TableColumn({
            name: "conciergeType",
            type: "varchar",
            isNullable: true,
            length: "255"
        }));

        await queryRunner.addColumn("appointment", new TableColumn({
            name: "durationHours",
            type: "int",
            default: 6,
            isNullable: false
        }));

        await queryRunner.addColumn("appointment", new TableColumn({
            name: "isConcierge",
            type: "tinyint",
            default: 0,
            isNullable: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert fields
        await queryRunner.dropColumn("appointment", "isConcierge");
        await queryRunner.dropColumn("appointment", "durationHours");
        await queryRunner.dropColumn("appointment", "conciergeType");

        // Revert doctorId to NOT NULL (careful if there are null values)
        await queryRunner.query(`ALTER TABLE \`appointment\` MODIFY COLUMN \`doctorId\` BIGINT UNSIGNED NOT NULL`);
    }

}
