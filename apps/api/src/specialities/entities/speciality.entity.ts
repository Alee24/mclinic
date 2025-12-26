import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('specialities')
export class Speciality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Doctor, (doctor) => doctor.specialities)
  doctors: Doctor[];
}
