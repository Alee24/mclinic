import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Encrypt } from '../../common/transformers/encryption.transformer';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  LAB_TECH = 'lab_tech',
  NURSE = 'nurse',
  CLINICIAN = 'clinician',
  MEDIC = 'medic',
  FINANCE = 'finance',
  PHARMACIST = 'pharmacist',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  otp: string | null;

  @Column({ type: 'datetime', nullable: true })
  otp_expires: Date | null;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  licenseNumber: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  specialization: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  bio: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: true })
  status: boolean; // mapped from status TINYINT(1)

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  // Patient-specific fields
  @Column({ length: 255, nullable: true, transformer: Encrypt })
  fname: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  lname: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  mobile: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  national_id: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  dob: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  sex: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
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

  @Column({ type: 'timestamp', nullable: true })
  deletionRequestedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deletionScheduledAt: Date | null;

  @Column({ name: 'last_access', type: 'timestamp', nullable: true })
  lastAccess: Date;
}
