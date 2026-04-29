import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedServiceFees1772221234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT IGNORE INTO system_setting (\`key\`, \`value\`, \`description\`, \`isSecure\`) VALUES
            ('FEE_BOOKING', '500', 'Default booking fee for appointments', 0),
            ('FEE_PHYSICAL_VISIT', '2000', 'Charge for physical/home visit consultations', 0),
            ('FEE_VIRTUAL_VISIT', '1000', 'Charge for virtual/telemedicine consultations', 0),
            ('FEE_AMBULANCE_BASE', '3000', 'Base charge for ambulance services', 0),
            ('COMMISSION_PERCENTAGE', '15', 'Percentage commission taken by the platform from each service', 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM system_setting WHERE key IN (
                'FEE_BOOKING', 
                'FEE_PHYSICAL_VISIT', 
                'FEE_VIRTUAL_VISIT', 
                'FEE_AMBULANCE_BASE', 
                'COMMISSION_PERCENTAGE'
            )
        `);
    }

}
