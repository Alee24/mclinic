import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSupportRequests1739220000000 implements MigrationInterface {
    name = 'CreateSupportRequests1739220000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "support_requests",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: "mobile",
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: "message",
                    type: "text",
                    isNullable: false
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["OPEN", "RESOLVED", "DISMISSED"],
                    default: "'OPEN'"
                },
                {
                    name: "adminResponse",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Seed some system settings for notifications
        await queryRunner.query(`
            INSERT INTO system_setting (\`key\`, \`value\`, \`description\`, \`isSecure\`) VALUES 
            ('admin_notification_mobile', '0724454757', 'Mobile number for admin notifications', 0),
            ('notify_on_signup', 'true', 'Enable admin notification on new user signup', 0),
            ('notify_on_booking', 'true', 'Enable admin notification on new appointment', 0),
            ('notify_on_payment_failure', 'true', 'Enable admin notification on payment failure', 0),
            ('notify_on_support_request', 'true', 'Enable admin notification on new support request', 0)
            ON DUPLICATE KEY UPDATE \`value\`=\`value\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("support_requests");

        // Optionally remove settings, but safer to keep them
        // await queryRunner.query(`DELETE FROM system_setting WHERE \`key\` IN ('admin_notification_mobile', 'notify_on_signup', 'notify_on_booking', 'notify_on_payment_failure', 'notify_on_support_request')`);
    }
}
