import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity()
export class ServicePrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    serviceName: string; // e.g., "Consultation", "Home Visit", "Lab Test"

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'KES' })
    currency: string;

    // If null, this is the base/global price for the service.
    // If set, this is a specific override for a doctor.
    @Column({ nullable: true, type: 'bigint', unsigned: true })
    doctorId: number;

    @ManyToOne(() => Doctor, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctorId' })
    doctor: Doctor;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
