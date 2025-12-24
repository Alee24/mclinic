import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    user_id: number;

    @OneToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 40, nullable: true })
    fname: string;

    @Column({ length: 50, nullable: true })
    lname: string;

    @Column({ length: 40, nullable: true })
    mobile: string;

    @Column({ length: 20, nullable: true })
    dob: string;

    @Column({ length: 20, nullable: true })
    sex: string;

    @Column({ length: 255, nullable: true })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    longitude: number;



    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
