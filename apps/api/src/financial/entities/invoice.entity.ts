import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceNumber: string; // Unique string e.g., INV-001

  @Column()
  customerName: string; // For guest users

  @Column()
  customerEmail: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column({ nullable: true })
  customerMobile: string;

  @Column({ nullable: true })
  paymentMethod: string; // e.g., 'MPESA', 'CASH', 'VISA'

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  doctorId: number; // To link payment to a doctor

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commissionAmount: number; // 40% of the fee

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ nullable: true })
  appointmentId: number;

  @ManyToOne('Appointment', { nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: any; // Using 'any' or importing Appointment to avoid circular dep issues if possible, but better to import.
}
