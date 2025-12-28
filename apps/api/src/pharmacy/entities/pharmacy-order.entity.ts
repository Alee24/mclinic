import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PharmacyOrderItem } from './pharmacy-order-item.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    MPESA = 'MPESA',
    CARD = 'CARD',
    CASH = 'CASH',
    INSURANCE = 'INSURANCE',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity()
export class PharmacyOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'bigint', unsigned: true })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ nullable: true })
    deliveryAddress: string;

    @Column({ nullable: true })
    deliveryCity: string;

    @Column({ nullable: true })
    contactPhone: string;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Column({ nullable: true })
    transactionId: string;

    @Column({ nullable: true })
    prescriptionId: string; // Optional link to source prescription

    @Column({ nullable: true })
    invoiceId: number; // Link to generated invoice

    @ManyToOne('Invoice', { nullable: true })
    @JoinColumn({ name: 'invoiceId' })
    invoice: any;

    @OneToMany(() => PharmacyOrderItem, (item: PharmacyOrderItem) => item.order, { cascade: true })
    items: PharmacyOrderItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
