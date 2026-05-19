import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1779070000000 implements MigrationInterface {
    name = 'CreateNotificationsTable1779070000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT NOT NULL AUTO_INCREMENT,
                userId INT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(255) NOT NULL,
                isRead BOOLEAN NOT NULL DEFAULT false,
                isAdminOnly BOOLEAN NOT NULL DEFAULT false,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE notifications`);
    }
}
