import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

import { Encrypt } from '../../common/transformers/encryption.transformer';

@Entity('medical_record')
export class MedicalRecord {
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

  @ManyToOne(() => Appointment, { nullable: true })
  appointment: Appointment;

  @Column({ nullable: true })
  appointmentId: number;

  @Column({ transformer: Encrypt })
  diagnosis: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  prescription: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
