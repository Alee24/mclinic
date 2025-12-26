import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    rating: number; // 1-5

    @Column({ type: 'text', nullable: true })
    comment: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'patientId' })
    patient: User;

    @Column({ type: 'bigint', unsigned: true })
    patientId: number;

    @ManyToOne(() => Doctor)
    @JoinColumn({ name: 'doctorId' })
    doctor: Doctor;

    @Column({ type: 'bigint', unsigned: true })
    doctorId: number;

    @OneToOne(() => Appointment, (appointment) => appointment.review)
    @JoinColumn({ name: 'appointmentId' })
    appointment: Appointment;

    @Column()
    appointmentId: number;

    @CreateDateColumn()
    createdAt: Date;
}
