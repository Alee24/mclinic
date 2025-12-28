import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LabTest } from './lab-test.entity';
import { LabResult } from './lab-result.entity';

export enum OrderStatus {
    PENDING = 'pending',
    SAMPLE_RECEIVED = 'sample_received',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Entity()
export class LabOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'patient_id' })
    patient: User;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    patient_id: number;

    @ManyToOne(() => LabTest)
    @JoinColumn({ name: 'test_id' })
    test: LabTest;

    @Column()
    test_id: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus; // pending, sample_received, processing, completed, cancelled

    @Column({ nullable: true })
    sample_collection_date: Date;

    @OneToMany(() => LabResult, result => result.order)
    results: LabResult[];

    @Column({ nullable: true })
    report_url: string; // Path to generated PDF

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
