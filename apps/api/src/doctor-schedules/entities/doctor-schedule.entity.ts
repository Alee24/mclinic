import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  doctor_id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'tinyint', nullable: true, comment: '1=Serial, 2=Time' })
  slot_type: number;

  @Column({ length: 40, nullable: true })
  start_time: string;

  @Column({ length: 40, nullable: true })
  end_time: string;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: 0 })
  max_serial: number;

  @Column({ default: 0 })
  serial_day: number;
}
