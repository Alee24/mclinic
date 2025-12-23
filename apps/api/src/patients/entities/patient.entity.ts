import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Patient {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { nullable: true })
    @JoinColumn()
    user: User;

    @Column({ nullable: true })
    userId: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    bloodType: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    maritalStatus: string;

    @Column({ nullable: true })
    occupation: string;

    @Column({ nullable: true })
    emergencyContactName: string;

    @Column({ nullable: true })
    emergencyContactPhone: string;

    @Column({ nullable: true })
    emergencyContactRelation: string;

    @Column({ nullable: true, type: 'text' })
    allergies: string;

    @Column({ nullable: true, type: 'text' })
    existingConditions: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
