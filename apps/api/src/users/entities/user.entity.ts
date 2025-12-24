import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum UserRole {
    PATIENT = 'patient',
    DOCTOR = 'doctor',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.PATIENT,
    })
    role: UserRole;

    @Column({ default: true })
    status: boolean; // mapped from status TINYINT(1)

    @Column({ type: 'timestamp', nullable: true })
    emailVerifiedAt: Date;

    @OneToMany(() => Wallet, (wallet) => wallet.user)
    wallets: Wallet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
