import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('data_deletion_requests')
export class DataDeletionRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    email: string;

    @Column('text', { nullable: true })
    reason: string;

    @Column({ default: 'pending' })
    status: string;

    @Column({ name: 'reviewed_by', type: 'bigint', unsigned: true, nullable: true })
    reviewedBy: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
