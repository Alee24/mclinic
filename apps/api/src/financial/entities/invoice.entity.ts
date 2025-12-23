import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
    PENDING = 'pending',
    PAID = 'paid',
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
