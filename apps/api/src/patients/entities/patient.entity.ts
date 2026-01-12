import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Encrypt } from '../../common/transformers/encryption.transformer';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
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

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  longitude: number;

  // Medical Biodata
  @Column({ length: 10, nullable: true })
  blood_group: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  genotype: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // in kg

  // Medical Records
  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  allergies: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  medical_history: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  family_history: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  social_history: string;

  // Emergency Contact
  @Column({ length: 100, nullable: true })
  emergency_contact_name: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  emergency_contact_phone: string;

  @Column({ length: 40, nullable: true })
  emergency_contact_relation: string;

  // Insurance
  @Column({ length: 100, nullable: true })
  insurance_provider: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  insurance_policy_no: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
