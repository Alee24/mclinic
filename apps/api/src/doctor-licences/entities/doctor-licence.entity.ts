import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('doctor_licences')
export class DoctorLicence {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    doctor_id: number;

    @ManyToOne(() => Doctor, (doctor) => doctor.licences, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctor_id' })
    doctor: Doctor;

    @Column({ length: 20, nullable: true })
    licence_no: string;

    @Column({ type: 'timestamp', nullable: true })
    expiry_date: Date;

    @Column({ length: 255, nullable: true })
    document: string;

    @Column({ default: false })
    verified: boolean;
}
