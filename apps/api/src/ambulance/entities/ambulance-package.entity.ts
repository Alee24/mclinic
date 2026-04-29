
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ambulance_packages')
export class AmbulancePackage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string; // e.g., 'Individual', 'Family', 'Mom & Dad'

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number; // Base charge

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    commission: number; // Platform commission

    @Column({ default: 365 })
    validity_days: number;

    @Column({ type: 'json', nullable: true })
    features: string[];

    // Group indicators (for Students/Corporate)
    @Column({ default: false })
    is_group_package: boolean;

    @Column({ default: 0 })
    min_members: number;

    // Constraints for validation
    @Column({ default: 0 })
    max_adults: number;

    @Column({ default: 0 })
    max_children: number;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
