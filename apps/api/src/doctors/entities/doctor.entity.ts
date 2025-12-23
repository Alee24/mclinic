import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { nullable: true })
    @JoinColumn()
    user: User;

    @Column({ nullable: true })
    userId: number;

    @Column()
    name: string;

    @Column()
    specialty: string;

    @Column()
    licenseNumber: string;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING,
    })
    verificationStatus: VerificationStatus;

    @Column({ nullable: true })
    boardNumber: string;

    @Column({ type: 'text', nullable: true })
    qualifications: string;

    @Column({ nullable: true })
    licenseExpiryDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ nullable: true })
    hospitalAffiliation: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
