import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnlineStatusToDoctors1778694000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure is_online column exists
        const hasIsOnline = await queryRunner.query("SHOW COLUMNS FROM doctors LIKE 'is_online'");
        if (hasIsOnline.length === 0) {
            await queryRunner.query("ALTER TABLE doctors ADD COLUMN is_online TINYINT DEFAULT 0");
        }

        // Ensure latitude column exists
        const hasLat = await queryRunner.query("SHOW COLUMNS FROM doctors LIKE 'latitude'");
        if (hasLat.length === 0) {
            await queryRunner.query("ALTER TABLE doctors ADD COLUMN latitude DECIMAL(10, 6) DEFAULT NULL");
        }

        // Ensure longitude column exists
        const hasLng = await queryRunner.query("SHOW COLUMNS FROM doctors LIKE 'longitude'");
        if (hasLng.length === 0) {
            await queryRunner.query("ALTER TABLE doctors ADD COLUMN longitude DECIMAL(10, 6) DEFAULT NULL");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration for safety
    }
}
