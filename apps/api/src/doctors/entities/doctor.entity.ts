import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Speciality } from '../../specialities/entities/speciality.entity';
import { DoctorSchedule } from '../../doctor-schedules/entities/doctor-schedule.entity';
import { DoctorLicence } from '../../doctor-licences/entities/doctor-licence.entity';



@Entity('doctors')
export class Doctor {
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
    username: string;

    @Column({ length: 20, nullable: true })
    national_id: string;

    @Column({ length: 20, nullable: true })
    dob: string;

    @Column({ length: 20, nullable: true })
    sex: string;

    @Column({ length: 40, nullable: true })
    mobile: string;

    @Column({ length: 255, nullable: true })
    address: string;

    @Column({ type: 'text', nullable: true })
    about: string;

    @Column({ length: 50, default: 'Nurse' })
    dr_type: string;

    @Column({ length: 255, nullable: true })
    qualification: string;

    @Column({ default: 1500 })
    fee: number;

    @Column({ type: 'decimal', precision: 28, scale: 2, default: 0.00 })
    balance: number;

    @Column({ length: 50, default: 'Pending' })
    approved_status: string;

    @Column({ default: false })
    verified_status: boolean;

    @Column({ default: false })
    featured: boolean;

    @Column({ default: true })
    status: boolean;

    @Column({ length: 255, nullable: true })
    profile_image: string;

    // Relations
    @ManyToMany(() => Speciality, (speciality) => speciality.doctors)
    @JoinTable({
        name: 'doctor_specialities',
        joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'speciality_id', referencedColumnName: 'id' },
    })
    specialities: Speciality[];

    @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
    schedules: DoctorSchedule[];

    @OneToMany(() => DoctorLicence, (licence) => licence.doctor)
    licences: DoctorLicence[];

    // Live Map / Current Status
    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number;

    @Column({ default: false })
    isWorking: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
