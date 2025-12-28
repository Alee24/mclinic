import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TestCategory {
    HEMATOLOGY = 'Hematology',
    BIOCHEMISTRY = 'Biochemistry',
    MICROBIOLOGY = 'Microbiology',
    IMMUNOLOGY = 'Immunology',
    PATHOLOGY = 'Pathology',
    RADIOLOGY = 'Radiology', // If applicable
    OTHER = 'Other'
}

@Entity()
export class LabTest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: TestCategory,
        default: TestCategory.OTHER
    })
    category: TestCategory;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
