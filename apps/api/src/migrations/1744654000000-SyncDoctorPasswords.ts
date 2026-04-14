import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncDoctorPasswords1744654000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Syncing doctor passwords from users table...');
    await queryRunner.query(`
      UPDATE doctors d
      JOIN users u ON d.email = u.email
      SET d.password = u.password
      WHERE d.password != u.password OR d.password IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op
  }
}
