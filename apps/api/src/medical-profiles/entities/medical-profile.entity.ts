import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('medical_profiles')
export class MedicalProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    user_id: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    // Vitals
    @Column({ length: 10, nullable: true })
    blood_group: string;

    @Column({ length: 10, nullable: true })
    genotype: string;

    @Column({ type: 'float', nullable: true })
    height: number;

    @Column({ type: 'float', nullable: true })
    weight: number;

    // History
    @Column({ type: 'text', nullable: true })
    allergies: string;

    @Column({ type: 'text', nullable: true })
    medical_history: string;

    @Column({ type: 'text', nullable: true })
    social_history: string;

    @Column({ type: 'text', nullable: true })
    family_history: string;

    // Emergency
    @Column({ length: 100, nullable: true })
    emergency_contact_name: string;

    @Column({ length: 40, nullable: true })
    emergency_contact_phone: string;

    @Column({ length: 40, nullable: true })
    emergency_contact_relation: string;

    // Insurance
    @Column({ length: 100, nullable: true })
    insurance_provider: string;

    @Column({ length: 50, nullable: true })
    insurance_policy_no: string;

    @Column({ length: 50, nullable: true })
    shif_number: string;

    @Column({ length: 50, default: 'Pay-As-You-Go' })
    subscription_plan: string;

    // Additional Medical Details
    @Column({ type: 'text', nullable: true })
    current_medications: string;

    @Column({ type: 'text', nullable: true })
    surgical_history: string;

    @Column({ type: 'text', nullable: true })
    disability_status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
