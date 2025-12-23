import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    transactionReference: string; // e.g., M-Pesa Receipt Number

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @Column()
    provider: string; // mpesa, visa, paypal

    @Column({ nullable: true })
    metadata: string; // JSON string for extra details

    @Column({ nullable: true })
    userId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
