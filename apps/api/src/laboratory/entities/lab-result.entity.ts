import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LabOrder } from './lab-order.entity';

@Entity()
export class LabResult {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => LabOrder, order => order.results, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: LabOrder;

    @Column()
    order_id: string;

    @Column()
    parameter_name: string; // e.g. Hemoglobin

    @Column()
    value: string; // e.g. 14.2 (String to capture mixed formats if needed, or keeping simple)

    @Column({ nullable: true })
    unit: string; // e.g. g/dL

    @Column({ nullable: true })
    reference_range: string; // e.g. 13.0 - 17.0

    @Column({ type: 'text', nullable: true })
    notes: string; // Technician comments

    @Column({ nullable: true })
    is_abnormal: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
