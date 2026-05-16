import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Speciality } from '../../specialities/entities/speciality.entity';
import { DoctorSchedule } from '../../doctor-schedules/entities/doctor-schedule.entity';
import { DoctorLicence } from '../../doctor-licences/entities/doctor-licence.entity';
import { Encrypt } from '../../common/transformers/encryption.transformer';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  fname: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  lname: string;

  @Column({ length: 40, nullable: true })
  username: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  national_id: string;

  @Column({ length: 40, unique: true })
  email: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  dob: string;

  @Column({ length: 50, nullable: true })
  reg_code: string;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'tinyint', default: 0 })
  Verified_status: number;

  @Column({ length: 50, default: 'Pending' })
  approved_status: string;

  @Column({ length: 20, default: 'pending' })
  approvalStatus: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  mobile: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  address: string;

  @Column({ type: 'decimal', precision: 28, scale: 2, default: 0.0 })
  balance: number;

  @Column({ length: 255, nullable: true })
  sex: string;

  @Column({ length: 255, nullable: true, transformer: Encrypt })
  qualification: string;

  @Column({ length: 255, nullable: true })
  speciality: string;

  @Column({ length: 50, default: 'Nurse' })
  dr_type: string;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  about: string;

  @Column({ type: 'tinyint', nullable: true })
  slot_type: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 1500 })
  fee: number;

  @Column({ type: 'text', nullable: true })
  serial_or_slot: string;

  @Column({ length: 40, nullable: true })
  start_time: string;

  @Column({ length: 40, nullable: true })
  end_time: string;

  @Column({ type: 'int', default: 0 })
  serial_day: number;

  @Column({ type: 'int', default: 0 })
  max_serial: number;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'int', nullable: true })
  department_id: number;

  @Column({ type: 'int', nullable: true })
  location_id: number;

  @Column({ type: 'text', nullable: true, transformer: Encrypt })
  licenceNo: string;

  @Column({ type: 'timestamp', nullable: true })
  licenceExpiry: Date;

  @Column({ length: 100, nullable: true })
  residance: string;

  // New Fields per Request
  @Column({ length: 50, nullable: true })
  regulatory_body: string;

  @Column({ type: 'int', default: 0 })
  years_of_experience: number;

  @Column({ length: 150, nullable: true })
  hospital_attachment: string;

  @Column({ type: 'tinyint', default: 0 })
  telemedicine: number; // 0 = No, 1 = Yes

  @Column({ type: 'tinyint', default: 0 })
  on_call: number; // 0 = No, 1 = Yes

  @Column({ type: 'tinyint', default: 0 })
  featured: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ type: 'tinyint', default: 0 })
  is_online: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ length: 255, nullable: true })
  profile_image: string;

  @Column({ length: 255, nullable: true })
  signatureUrl: string;

  @Column({ length: 255, nullable: true })
  stampUrl: string;

  // Relations restored to satisfy compilation
  @ManyToMany(() => Speciality, (speciality) => speciality.doctors)
  @JoinTable({
    name: 'doctor_specialities',
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'speciality_id', referencedColumnName: 'id' },
  })
  specialities: Speciality[];

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  schedules: DoctorSchedule[];

  @Column({ type: 'varchar', length: 10, nullable: true })
  otp: string | null;

  @Column({ type: 'datetime', nullable: true })
  otp_expires: Date | null;

  @Column({ length: 100, nullable: true })
  resetToken: string;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpiry: Date;

  @Column({ type: 'tinyint', default: 0 })
  can_prescribe: number;

  @OneToMany(() => DoctorLicence, (licence) => licence.doctor)
  licences: DoctorLicence[];

  @Column({ type: 'timestamp', nullable: true })
  lastAccess: Date;

  @Column({ type: 'tinyint', default: 0 })
  accepted_terms: number;

  @Column({ type: 'tinyint', default: 0 })
  onboarding_completed: number;
}
