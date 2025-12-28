import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Service } from '../../services/entities/service.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
  RESCHEDULED = 'rescheduled',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  patient: User;

  @Column({ type: 'bigint', unsigned: true })
  patientId: number;

  @ManyToOne(() => Doctor)
  doctor: Doctor;

  @Column({ type: 'bigint', unsigned: true })
  doctorId: number;

  @ManyToOne(() => Service, { nullable: true, onDelete: 'SET NULL' })
  service: Service;

  @Column({ nullable: true })
  serviceId: number;

  @Column({ type: 'date', nullable: true })
  appointment_date: Date;

  @Column({ length: 40, nullable: true })
  appointment_time: string;

  @Column({ default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  transportFee: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  meetingLink: string;

  @Column({ nullable: true })
  meetingId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  // --- Enhanced Booking Fields ---

  @Column({ default: true })
  isForSelf: boolean;

  @Column({ nullable: true })
  beneficiaryName: string;

  @Column({ nullable: true })
  beneficiaryGender: string;

  @Column({ nullable: true })
  beneficiaryAge: string;

  @Column({ nullable: true })
  beneficiaryRelation: string;

  @Column({ type: 'text', nullable: true })
  activeMedications: string;

  @Column({ type: 'text', nullable: true })
  currentPrescriptions: string;

  @Column({ nullable: true })
  homeAddress: string;

  // -------------------------------

  @OneToOne(() => Review, (review) => review.appointment)
  review: Review;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
