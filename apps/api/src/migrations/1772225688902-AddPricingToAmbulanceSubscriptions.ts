import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPricingToAmbulanceSubscriptions1772225688902 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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

        await addColumnSafe('ambulance_subscriptions', 'price', 'decimal(10,2) NOT NULL DEFAULT 0.00');
        await addColumnSafe('ambulance_subscriptions', 'commission', 'decimal(10,2) NOT NULL DEFAULT 0.00');
        await addColumnSafe('ambulance_subscriptions', 'total_amount', 'decimal(10,2) NOT NULL DEFAULT 0.00');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try { await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP COLUMN \`price\``); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP COLUMN \`commission\``); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`ambulance_subscriptions\` DROP COLUMN \`total_amount\``); } catch (e) {}
    }

}
