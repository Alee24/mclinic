import { MigrationInterface, QueryRunner } from "typeorm";

export class RestoreAdminRole1777860000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Restore Admin role for the user who was accidentally downgraded to DOCTOR
        // adriel.pacocha@gmail.com was seen in the screenshot as a Doctor but user expects Admin
        await queryRunner.query(`
            UPDATE users 
            SET role = 'admin' 
            WHERE email = 'adriel.pacocha@gmail.com'
        `);

        // Also ensure any other admin who might have been caught in the sync is restored
        // We can check if their doctor profile dr_type was 'Admin' but they got changed to 'medic' or similar
        // For safety, let's just fix the known one and maybe one more common one if it exists
        // Actually, we'll just fix this one as requested.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No obvious rollback other than setting back to doctor, which we don't want
    }
}
