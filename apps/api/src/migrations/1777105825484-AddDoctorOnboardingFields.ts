import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorOnboardingFields1777105825484 implements MigrationInterface {

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

        await addColumnSafe('doctors', 'accepted_terms', 'TINYINT DEFAULT 0');
        await addColumnSafe('doctors', 'onboarding_completed', 'TINYINT DEFAULT 0');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try { await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`accepted_terms\``); } catch (e) {}
        try { await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`onboarding_completed\``); } catch (e) {}
    }

}
