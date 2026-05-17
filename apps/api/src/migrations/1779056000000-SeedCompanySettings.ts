import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCompanySettings1779056000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const defaultSettings = [
            { key: 'COMPANY_NAME', value: 'M-Clinic Services Kenya', description: 'Company Name', isSecure: false },
            { key: 'COMPANY_TAGLINE', value: 'Official Digital Healthcare Portal', description: 'Company Tagline/Slogan', isSecure: false },
            { key: 'COMPANY_LOGO_URL', value: 'https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png', description: 'Company Logo URL', isSecure: false },
            { key: 'COMPANY_EMAIL', value: 'support@mclinic.co.ke', description: 'Company Contact Email', isSecure: false },
            { key: 'COMPANY_PHONE', value: '+254 724 454 757', description: 'Company Contact Phone Number', isSecure: false },
            { key: 'COMPANY_ADDRESS', value: 'Nairobi, Kenya', description: 'Company Physical Address', isSecure: false },
            { key: 'COMPANY_BANK_NAME', value: 'Equity Bank', description: 'Company Bank Name', isSecure: false },
            { key: 'COMPANY_BANK_ACC_NAME', value: 'M-Clinic Services Limited', description: 'Company Bank Account Name', isSecure: false },
            { key: 'COMPANY_BANK_ACC_NO', value: '1234567890123', description: 'Company Bank Account Number', isSecure: false },
            { key: 'COMPANY_MPESA_TILL_PAYBILL', value: '300977', description: 'Company M-Pesa Till or Paybill Number', isSecure: false },
            { key: 'COMPANY_FB', value: 'https://facebook.com/mclinic', description: 'Facebook Profile URL', isSecure: false },
            { key: 'COMPANY_TWITTER', value: 'https://twitter.com/mclinic', description: 'Twitter/X Profile URL', isSecure: false },
            { key: 'COMPANY_IG', value: 'https://instagram.com/mclinic', description: 'Instagram Profile URL', isSecure: false },
            { key: 'COMPANY_LINKEDIN', value: 'https://linkedin.com/company/mclinic', description: 'LinkedIn Company URL', isSecure: false },
        ];

        for (const s of defaultSettings) {
            const exists = await queryRunner.query(
                `SELECT * FROM system_setting WHERE \`key\` = ?`,
                [s.key]
            );
            if (exists.length === 0) {
                await queryRunner.query(
                    `INSERT INTO system_setting (\`key\`, \`value\`, \`description\`, \`isSecure\`) VALUES (?, ?, ?, ?)`,
                    [s.key, s.value, s.description, s.isSecure]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const keys = [
            'COMPANY_NAME',
            'COMPANY_TAGLINE',
            'COMPANY_LOGO_URL',
            'COMPANY_EMAIL',
            'COMPANY_PHONE',
            'COMPANY_ADDRESS',
            'COMPANY_BANK_NAME',
            'COMPANY_BANK_ACC_NAME',
            'COMPANY_BANK_ACC_NO',
            'COMPANY_MPESA_TILL_PAYBILL',
            'COMPANY_FB',
            'COMPANY_TWITTER',
            'COMPANY_IG',
            'COMPANY_LINKEDIN'
        ];
        for (const key of keys) {
            await queryRunner.query(
                `DELETE FROM system_setting WHERE \`key\` = ?`,
                [key]
            );
        }
    }
}
