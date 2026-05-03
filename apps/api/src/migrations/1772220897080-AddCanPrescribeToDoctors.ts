import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCanPrescribeToDoctors1772220897080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE doctors ADD COLUMN can_prescribe TINYINT(1) DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE doctors ADD COLUMN approvalStatus VARCHAR(20) DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE doctors ADD COLUMN rejectionReason TEXT DEFAULT NULL`);

        // Initial authority setup: Clinical Officers and Doctors/Specialists get prescription powers by default
        await queryRunner.query(`UPDATE doctors SET can_prescribe = 1 WHERE dr_type IN ('Clinical Officer', 'Specialist', 'Doctor')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE doctors DROP COLUMN can_prescribe`);
        await queryRunner.query(`ALTER TABLE doctors DROP COLUMN approvalStatus`);
        await queryRunner.query(`ALTER TABLE doctors DROP COLUMN rejectionReason`);
    }

}
