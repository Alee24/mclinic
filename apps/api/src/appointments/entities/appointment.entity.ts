import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

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

    @Column()
    patientId: number;

    @ManyToOne(() => Doctor)
    doctor: Doctor;

    @Column()
    doctorId: number;

    @Column({ type: 'datetime' })
    dateTime: Date;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    })
    status: AppointmentStatus;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
