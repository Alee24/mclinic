import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Service } from '../../services/entities/service.entity';

export enum AppointmentStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Patient)
    patient: Patient;

    @Column({ type: 'bigint', unsigned: true })
    patientId: number;

    @ManyToOne(() => Doctor)
    doctor: Doctor;

    @Column({ type: 'bigint', unsigned: true })
    doctorId: number;

    // @ManyToOne(() => Service, { nullable: true, onDelete: 'SET NULL' })
    // service: Service;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    serviceId: number;

    @Column({ type: 'date', nullable: true })
    appointment_date: Date;

    @Column({ length: 40, nullable: true })
    appointment_time: string;

    @Column({ default: 0 })
    fee: number;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    })
    status: AppointmentStatus;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true })
    meetingLink: string;

    @Column({ nullable: true })
    meetingId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
