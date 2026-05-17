import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRatingToUsers1779036000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRating = await queryRunner.hasColumn('users', 'rating');
        if (!hasRating) {
            await queryRunner.addColumn(
                'users',
                new TableColumn({
                    name: 'rating',
                    type: 'decimal',
                    precision: 3,
                    scale: 2,
                    default: 4.90,
                    isNullable: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasRating = await queryRunner.hasColumn('users', 'rating');
        if (hasRating) {
            await queryRunner.dropColumn('users', 'rating');
        }
    }
}
