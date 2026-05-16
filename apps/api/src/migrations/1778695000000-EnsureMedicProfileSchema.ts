import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureMedicProfileSchema1778695000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const columns = [
            { name: 'qualification', type: 'VARCHAR(255) NULL' },
            { name: 'speciality', type: 'VARCHAR(255) NULL' },
            { name: 'about', type: 'TEXT NULL' },
            { name: 'fee', type: 'INT DEFAULT 1500' },
            { name: 'licenceNo', type: 'VARCHAR(255) NULL' },
            { name: 'licenceExpiry', type: 'TIMESTAMP NULL' },
            { name: 'regulatory_body', type: 'VARCHAR(100) NULL' },
            { name: 'years_of_experience', type: 'INT DEFAULT 0' },
            { name: 'hospital_attachment', type: 'VARCHAR(255) NULL' },
            { name: 'telemedicine', type: 'TINYINT DEFAULT 0' },
            { name: 'on_call', type: 'TINYINT DEFAULT 0' },
            { name: 'profile_image', type: 'VARCHAR(255) NULL' },
            { name: 'signatureUrl', type: 'VARCHAR(255) NULL' },
            { name: 'stampUrl', type: 'VARCHAR(255) NULL' },
            { name: 'can_prescribe', type: 'TINYINT DEFAULT 0' },
            { name: 'accepted_terms', type: 'TINYINT DEFAULT 0' },
            { name: 'onboarding_completed', type: 'TINYINT DEFAULT 0' },
            { name: 'is_online', type: 'TINYINT DEFAULT 0' },
            { name: 'latitude', type: 'DECIMAL(10, 6) NULL' },
            { name: 'longitude', type: 'DECIMAL(10, 6) NULL' },
            { name: 'address', type: 'VARCHAR(255) NULL' },
            { name: 'reg_code', type: 'VARCHAR(50) NULL' }
        ];

        for (const col of columns) {
            const hasColumn = await queryRunner.query(
                `SHOW COLUMNS FROM \`doctors\` LIKE '${col.name}'`
            );
            if (hasColumn.length === 0) {
                await queryRunner.query(
                    `ALTER TABLE \`doctors\` ADD \`${col.name}\` ${col.type}`
                );
                console.log(`[Migration] Added missing column ${col.name} to doctors table.`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration to prevent data loss
    }
}
