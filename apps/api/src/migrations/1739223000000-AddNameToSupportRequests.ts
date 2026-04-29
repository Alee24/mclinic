import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNameToSupportRequests1739223000000 implements MigrationInterface {
    name = 'AddNameToSupportRequests1739223000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("support_requests");
        const hasColumn = table?.findColumnByName("name");
        
        if (!hasColumn) {
            await queryRunner.addColumn(
                "support_requests",
                new TableColumn({
                    name: "name",
                    type: "varchar",
                    length: "255",
                    isNullable: true
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("support_requests", "name");
    }
}
