import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  LAB_TECH = 'lab_tech',
  NURSE = 'nurse',
  CLINICIAN = 'clinician',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ default: true })
  status: boolean; // mapped from status TINYINT(1)

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  // Patient-specific fields
  @Column({ length: 40, nullable: true })
  fname: string;

  @Column({ length: 50, nullable: true })
  lname: string;

  @Column({ length: 40, nullable: true })
  mobile: string;

  @Column({ length: 20, nullable: true })
  national_id: string;

  @Column({ length: 20, nullable: true })
  dob: string;

  @Column({ length: 20, nullable: true })
  sex: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'profile_image', nullable: true })
  profilePicture: string;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
