import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Service } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';

export enum RecommendationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    PAID = 'paid'
}

export enum RecommendationType {
    REPEAT_VISIT = 'Repeat Visit',
    DRUG_ADMINISTRATION = 'Drug Administration',
    VIRTUAL_SESSION = 'Virtual Session',
    EMERGENCY_EVACUATION = 'Emergency Evacuation',
    ADMISSION = 'Admission',
    OTHER = 'Other'
}

@Entity()
export class AppointmentRecommendation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: RecommendationType,
        default: RecommendationType.OTHER
    })
    type: RecommendationType;

    @Column({ nullable: true })
    notes: string;

    @Column({
        type: 'enum',
        enum: RecommendationStatus,
        default: RecommendationStatus.PENDING
    })
    status: RecommendationStatus;

    @ManyToOne(() => Appointment)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @Column({ insert: false, update: false })
    appointment_id: number;

    @ManyToOne(() => Service, { nullable: true })
    @JoinColumn({ name: 'service_id' })
    service: Service;

    @Column({ nullable: true, insert: false, update: false })
    service_id: number;

    // Optional: Link directly to patient/doctor if needed for ease of query
    // But appointment link is usually sufficient.

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
