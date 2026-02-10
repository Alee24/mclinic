import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMedicsTable1739224000000 implements MigrationInterface {
    name = 'CreateMedicsTable1739224000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "medics",
            columns: [
                { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: 'increment', unsigned: true },
                { name: "fname", type: "varchar", length: "40", isNullable: true },
                { name: "lname", type: "varchar", length: "50", isNullable: true },
                { name: "username", type: "varchar", length: "40", isNullable: true },
                { name: "national_id", type: "varchar", length: "20", isNullable: true },
                { name: "email", type: "varchar", length: "40", isUnique: true },
                { name: "dob", type: "varchar", length: "20", isNullable: true },
                { name: "reg_code", type: "varchar", length: "50", isNullable: true },
                { name: "user_id", type: "int", isNullable: true },
                { name: "Verified_status", type: "tinyint", default: 0 },
                { name: "approved_status", type: "varchar", length: "50", default: "'Pending'" },
                { name: "password", type: "varchar", length: "255", isNullable: true },
                { name: "mobile", type: "varchar", length: "20", isNullable: true },
                { name: "address", type: "varchar", length: "255", isNullable: true },
                { name: "balance", type: "decimal", precision: 28, scale: 2, default: 0.00 },
                { name: "sex", type: "varchar", length: "20", isNullable: true },
                { name: "qualification", type: "varchar", length: "255", isNullable: true },
                { name: "speciality", type: "varchar", length: "255", isNullable: true },
                { name: "dr_type", type: "varchar", length: "50", default: "'Nurse'" },
                { name: "about", type: "text", isNullable: true },
                { name: "slot_type", type: "tinyint", isNullable: true },
                { name: "latitude", type: "decimal", precision: 10, scale: 6, isNullable: true },
                { name: "longitude", type: "decimal", precision: 10, scale: 6, isNullable: true },
                { name: "fee", type: "int", default: 1500 },
                { name: "serial_or_slot", type: "text", isNullable: true },
                { name: "start_time", type: "varchar", length: "40", isNullable: true },
                { name: "end_time", type: "varchar", length: "40", isNullable: true },
                { name: "serial_day", type: "int", default: 0 },
                { name: "max_serial", type: "int", default: 0 },
                { name: "duration", type: "int", default: 0 },
                { name: "department_id", type: "int", isNullable: true },
                { name: "location_id", type: "int", isNullable: true },
                { name: "licenceNo", type: "varchar", length: "20", isNullable: true },
                { name: "licenceExpiry", type: "timestamp", isNullable: true },
                { name: "residance", type: "varchar", length: "100", isNullable: true },
                { name: "regulatory_body", type: "varchar", length: "50", isNullable: true },
                { name: "years_of_experience", type: "int", default: 0 },
                { name: "hospital_attachment", type: "varchar", length: "150", isNullable: true },
                { name: "telemedicine", type: "tinyint", default: 0 },
                { name: "on_call", type: "tinyint", default: 0 },
                { name: "featured", type: "tinyint", default: 0 },
                { name: "status", type: "tinyint", default: 0 },
                { name: "is_online", type: "tinyint", default: 0 },
                { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
                { name: "updated_at", type: "timestamp", isNullable: true, onUpdate: "CURRENT_TIMESTAMP" },
                { name: "profile_image", type: "varchar", length: "255", isNullable: true },
                { name: "signatureUrl", type: "varchar", length: "255", isNullable: true },
                { name: "stampUrl", type: "varchar", length: "255", isNullable: true },
                { name: "approvalStatus", type: "enum", enum: ["pending", "approved", "rejected"], default: "'pending'" },
                { name: "rejectionReason", type: "text", isNullable: true },
                { name: "licenseExpiryDate", type: "date", isNullable: true },
                { name: "licenseStatus", type: "enum", enum: ["valid", "expiring_soon", "expired"], default: "'valid'" },
                { name: "lastLicenseCheck", type: "datetime", isNullable: true },
                { name: "approvedAt", type: "datetime", isNullable: true },
                { name: "approvedBy", type: "bigint", isNullable: true },
                { name: "otp", type: "varchar", length: "10", isNullable: true },
                { name: "otpExpiry", type: "datetime", isNullable: true },
                { name: "resetToken", type: "varchar", length: "100", isNullable: true },
                { name: "resetTokenExpiry", type: "datetime", isNullable: true },
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("medics");
    }
}
