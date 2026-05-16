import { MigrationInterface, QueryRunner } from "typeorm";

export class ActivateAllMedics1778696000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Activate all registered medics
        await queryRunner.query(`
            UPDATE \`doctors\` 
            SET \`Verified_status\` = 1, 
                \`status\` = 1, 
                \`approvalStatus\` = 'approved'
            WHERE \`status\` = 0 OR \`Verified_status\` = 0
        `);

        // 2. Assign random locations in Nairobi for medics without coordinates
        // Nairobi center is approx -1.2921, 36.8219
        const doctors = await queryRunner.query(`
            SELECT id FROM \`doctors\` 
            WHERE \`latitude\` IS NULL OR \`longitude\` IS NULL OR \`latitude\` = 0
        `);

        for (const doc of doctors) {
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;
            const lat = -1.2921 + latOffset;
            const lng = 36.8219 + lngOffset;

            await queryRunner.query(
                `UPDATE \`doctors\` SET \`latitude\` = ?, \`longitude\` = ? WHERE id = ?`,
                [lat, lng, doc.id]
            );
        }

        console.log(`[Migration] Activated ${doctors.length} medics and assigned random Nairobi locations.`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration
    }
}
