import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PharmacyOrder } from './pharmacy-order.entity';
import { Medication } from './medication.entity';

@Entity()
export class PharmacyOrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    orderId: string;

    @ManyToOne(() => PharmacyOrder, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: PharmacyOrder;

    @Column({ nullable: true })
    medicationId: string;

    @ManyToOne(() => Medication, { nullable: true })
    @JoinColumn({ name: 'medicationId' })
    medication: Medication;

    @Column()
    medicationName: string;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;
}
