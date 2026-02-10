import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SupportRequestStatus {
    OPEN = 'OPEN',
    RESOLVED = 'RESOLVED',
    DISMISSED = 'DISMISSED'
}

@Entity('support_requests')
export class SupportRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    mobile: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: SupportRequestStatus,
        default: SupportRequestStatus.OPEN
    })
    status: SupportRequestStatus;

    @Column({ nullable: true })
    adminResponse: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
