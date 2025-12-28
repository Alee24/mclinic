import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { PrescriptionItem } from './prescription-item.entity';

export enum PrescriptionStatus {
    PENDING = 'pending',     // Created by doctor, not yet processed/ordered
    ORDERED = 'ordered',     // Patient has ordered/paid
    DISPENSED = 'dispensed', // Pharmacy has dispensed
    CANCELLED = 'cancelled'
}

@Entity()
export class Prescription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Appointment, { nullable: true })
    @JoinColumn({ name: 'appointmentId' })
    appointment: Appointment;

    @Column({ nullable: true })
    appointmentId: number;

    @ManyToOne(() => Doctor)
    @JoinColumn({ name: 'doctorId' })
    doctor: Doctor;

    @Column({ type: 'bigint', unsigned: true })
    doctorId: number;

    @Column({ nullable: true })
    doctorSignatureUrl: string;

    @Column({ nullable: true })
    doctorStampUrl: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'patientId' })
    patient: User;

    @Column({ type: 'bigint', unsigned: true })
    patientId: number;

    @OneToMany(() => PrescriptionItem, (item) => item.prescription, { cascade: true })
    items: PrescriptionItem[];

    @Column({
        type: 'enum',
        enum: PrescriptionStatus,
        default: PrescriptionStatus.PENDING,
    })
    status: PrescriptionStatus;

    @Column({ type: 'text', nullable: true })
    notes: string; // Doctor's general notes

    @Column({ nullable: true })
    validUntil: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
