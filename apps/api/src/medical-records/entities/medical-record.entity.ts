import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity()
export class MedicalRecord {
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

    @Column()
    diagnosis: string;

    @Column({ type: 'text', nullable: true })
    prescription: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
