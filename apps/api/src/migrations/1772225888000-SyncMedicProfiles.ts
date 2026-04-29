import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncMedicProfiles1772225888000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find all users with healthcare roles who are NOT in the doctors table
        const users = await queryRunner.query(`
            SELECT id, email, fname, lname, role, mobile, address, password, dob, sex, profile_image
            FROM users 
            WHERE role IN ('medic', 'doctor', 'nurse', 'clinician', 'lab_tech', 'pharmacist')
            AND email NOT IN (SELECT email FROM doctors)
        `);

        for (const user of users) {
             // Map User Role to Doctor Type (simplifying for migration)
             let drType = 'Medic';
             if (user.role === 'doctor') drType = 'Specialist';
             else if (user.role === 'nurse') drType = 'Nurse';
             else if (user.role === 'clinician') drType = 'Clinical Officer';
             
             await queryRunner.query(`
                INSERT INTO doctors (
                    user_id, email, fname, lname, dr_type, password, 
                    mobile, address, dob, sex, profile_image, 
                    Verified_status, status, approvalStatus, fee
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'approved', 1500)
             `, [
                user.id, user.email, user.fname, user.lname, drType, user.password,
                user.mobile, user.address, user.dob, user.sex, user.profile_image
             ]);
             
             console.log(`[Migration] Created doctor profile for ${user.email}`);
        }

        // Also backfill user_id for existing doctors who don't have it
        await queryRunner.query(`
            UPDATE doctors d
            JOIN users u ON d.email = u.email
            SET d.user_id = u.id
            WHERE d.user_id IS NULL OR d.user_id = 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration for data sync
    }
}
