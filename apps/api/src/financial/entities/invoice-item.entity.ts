import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class InvoiceItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoiceId' })
    invoice: Invoice;
}
