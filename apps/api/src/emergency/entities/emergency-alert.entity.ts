import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('emergency_alerts')
export class EmergencyAlert {
    @PrimaryGeneratedColumn()
    id: number;

    // Virtual property for easier access if needed (optional)
    medicId?: number;

    @ManyToOne(() => Doctor)
    @JoinColumn({ name: 'medicId' })
    medic: Doctor;

    @Column('decimal', { precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column('decimal', { precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ nullable: true })
    audioUrl: string;

    @Column({ default: 'active' }) // active, resolved, false_alarm
    status: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
