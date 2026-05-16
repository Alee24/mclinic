import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSchemaBeforeSync1772225887999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Increase lengths for all encrypted columns in doctors, users, and patients
        // This MUST run before SyncMedicProfiles
        const tables = ['users', 'doctors', 'patients'];
        
        for (const table of tables) {
            console.log(`[Migration] Fixing schema for table: ${table}`);
            
            // Check if table exists before modifying
            const tableExists = await queryRunner.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = '${table}'
            `);

            if (tableExists[0].count > 0) {
                // Modify columns to be long enough for encrypted strings (iv:ciphertext)
                // Using try-catch for each to prevent failure if a column is missing in a specific table
                const columns = [
                    { name: 'fname', type: 'VARCHAR(255)' },
                    { name: 'lname', type: 'VARCHAR(255)' },
                    { name: 'mobile', type: 'VARCHAR(255)' },
                    { name: 'dob', type: 'VARCHAR(255)' },
                    { name: 'sex', type: 'VARCHAR(255)' },
                    { name: 'national_id', type: 'VARCHAR(255)' },
                    { name: 'address', type: 'TEXT' }
                ];

                for (const col of columns) {
                    try {
                        await queryRunner.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${col.name}\` ${col.type} NULL`);
                    } catch (e) {
                        // Ignore if column doesn't exist in this specific table
                    }
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No rollback needed for schema expansion
    }
}
