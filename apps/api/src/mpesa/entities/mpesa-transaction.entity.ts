import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MpesaTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    merchantRequestId: string;

    @Column()
    checkoutRequestId: string;

    @Column()
    phoneNumber: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    accountReference: string;

    @Column({ nullable: true })
    transactionDesc: string;

    @Column({ default: 'PENDING' })
    status: string; // PENDING, SUCCESS, FAILED, CANCELLED

    @Column({ nullable: true })
    resultCode: string;

    @Column({ nullable: true })
    resultDesc: string;

    @Column({ nullable: true })
    mpesaReceiptNumber: string;

    @Column({ nullable: true, type: 'datetime' })
    transactionDate: Date;

    @Column({ nullable: true })
    relatedEntity: string; // invoice, appointment, pharmacy_order, etc.

    @Column({ nullable: true })
    relatedEntityId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
