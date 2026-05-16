import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommissionToAmbulancePackages1772225678901 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use a safe wrapper to avoid "Duplicate column" errors in production
        const addColumnSafe = async (table: string, column: string, definition: string) => {
            try {
                await queryRunner.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
            } catch (e: any) {
                if (e.message.includes('Duplicate column name')) {
                    console.log(`[Migration] Column ${column} already exists in ${table}, skipping.`);
                } else {
                    throw e;
                }
            }
        };

        await addColumnSafe('ambulance_packages', 'commission', 'decimal(10,2) NOT NULL DEFAULT 0.00');
        await addColumnSafe('ambulance_packages', 'is_group_package', 'tinyint NOT NULL DEFAULT 0');
        await addColumnSafe('ambulance_packages', 'min_members', 'int NOT NULL DEFAULT 0');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try { await queryRunner.query(`ALTER TABLE \`ambulance_packages\` DROP COLUMN \`commission\``); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`ambulance_packages\` DROP COLUMN \`is_group_package\``); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`ambulance_packages\` DROP COLUMN \`min_members\``); } catch (e) {}
    }

}
