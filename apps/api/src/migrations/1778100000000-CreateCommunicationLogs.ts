import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommunicationLogs1778100000000 implements MigrationInterface {
    name = 'CreateCommunicationLogs1778100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS communication_logs (
                id INT NOT NULL AUTO_INCREMENT,
                type ENUM('email', 'sms') NOT NULL,
                recipient VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NULL,
                content TEXT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'sent',
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE communication_logs`);
    }
}
