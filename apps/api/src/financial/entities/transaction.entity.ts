import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invoice } from './invoice.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'decimal', precision: 28, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['credit', 'debit'], default: 'debit' })
  type: string;

  @Column({ length: 50, default: 'MPESA' })
  source: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true, type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  invoiceId: number;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @CreateDateColumn()
  createdAt: Date;
}
