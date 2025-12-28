
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ambulance_subscriptions')
export class AmbulanceSubscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    user_id: number;

    // 1. Primary Subscriber Details
    @Column()
    primary_subscriber_name: string;

    @Column({ type: 'date', nullable: true })
    dob: string;

    @Column({ length: 20, nullable: true })
    gender: string;

    @Column({ length: 50, nullable: true })
    identification_number: string;

    @Column({ length: 50, nullable: true })
    nationality: string;

    @Column({ length: 50, nullable: true })
    language_spoken: string;

    @Column({ nullable: true })
    photo_url: string;

    // 2. Contact & Location
    @Column({ length: 20 })
    primary_phone: string;

    @Column({ length: 20, nullable: true })
    secondary_phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    residential_address: string;

    @Column({ nullable: true })
    county: string;

    @Column({ nullable: true })
    estate: string;

    @Column({ nullable: true })
    street: string;

    @Column({ nullable: true })
    house_details: string;

    @Column({ nullable: true })
    landmark: string;

    @Column({ type: 'text', nullable: true })
    gps_coordinates: string;

    @Column({ nullable: true })
    work_address: string;

    // 3. Medical Bio-Data (Subscriber)
    @Column({ length: 10, nullable: true })
    blood_type: string;

    @Column({ type: 'text', nullable: true })
    allergies: string;

    @Column({ type: 'text', nullable: true })
    chronic_conditions: string;

    @Column({ type: 'text', nullable: true })
    current_medications: string;

    @Column({ type: 'text', nullable: true })
    surgical_history: string;

    @Column({ type: 'text', nullable: true })
    disabilities: string;

    @Column({ nullable: true })
    pregnancy_status: string;

    @Column({ nullable: true })
    preferred_hospital: string;

    @Column({ nullable: true })
    insurance_details: string;

    // 4. Family Members (Stored as JSON for flexibility)
    @Column({ type: 'json', nullable: true })
    family_members: {
        name: string;
        relationship: string;
        dob: string;
        gender: string;
        medical_conditions: string;
        photo_url?: string;
    }[];

    // 5. Emergency Contacts
    @Column({ type: 'json', nullable: true })
    emergency_contacts: {
        name: string;
        relationship: string;
        phone: string;
    }[];

    // Subscription Plan Details
    @Column()
    package_type: string; // 'individual', 'family', 'parents', 'couple'

    @Column({ default: 'active' })
    status: string; // 'active', 'expired', 'pending'

    @Column({ type: 'date', nullable: true })
    start_date: string;

    @Column({ type: 'date', nullable: true })
    end_date: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
