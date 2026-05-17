import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAppointmentIdAndNotesToLabOrder1779028800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and add appointment_id if not exists
        const hasAppointmentId = await queryRunner.hasColumn('lab_order', 'appointment_id');
        if (!hasAppointmentId) {
            await queryRunner.addColumn(
                'lab_order',
                new TableColumn({
                    name: 'appointment_id',
                    type: 'int',
                    isNullable: true,
                }),
            );
        }

        // Check and add notes if not exists
        const hasNotes = await queryRunner.hasColumn('lab_order', 'notes');
        if (!hasNotes) {
            await queryRunner.addColumn(
                'lab_order',
                new TableColumn({
                    name: 'notes',
                    type: 'text',
                    isNullable: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasAppointmentId = await queryRunner.hasColumn('lab_order', 'appointment_id');
        if (hasAppointmentId) {
            await queryRunner.dropColumn('lab_order', 'appointment_id');
        }

        const hasNotes = await queryRunner.hasColumn('lab_order', 'notes');
        if (hasNotes) {
            await queryRunner.dropColumn('lab_order', 'notes');
        }
    }
}
