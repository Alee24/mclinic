import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAdminUser1778110000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert Admin User if not exists
        // fname: Metto, lname: Alex, mobile: 0724454757 (encrypted)
        // password: Digital2025 (hashed)
        await queryRunner.query(`
            INSERT INTO users (
                email, 
                password, 
                role, 
                fname, 
                lname, 
                mobile, 
                status, 
                emailVerifiedAt,
                createdAt,
                updatedAt
            ) VALUES (
                'mettoalex@gmail.com', 
                '$2b$10$7V7UnZvKmr3hCsmJ2gJ5AedVH2BaC2I28eaxz/lJrk/VdrFqHSw1G', 
                'admin', 
                'ca8b465c3afd76b63b8f5518ba04df8b:6fc13a7e6d2305c90940ed00812d67a0', 
                'e8613c326a9a7861e5ed5f5ee21aa31c:782d2ffff44516dcb60f0d11d618f0ac', 
                'f7924291c27c45f64c07e6685e49fc4b:1329331edf086ee68c1e4f3c1f832540', 
                1, 
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6)
            ) ON DUPLICATE KEY UPDATE 
                role = 'admin',
                status = 1,
                password = '$2b$10$7V7UnZvKmr3hCsmJ2gJ5AedVH2BaC2I28eaxz/lJrk/VdrFqHSw1G'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We don't remove the user in down migration to avoid accidental data loss
    }

}
