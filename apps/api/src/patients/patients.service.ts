import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientsRepository: Repository<Patient>,
    ) { }

    async create(createPatientDto: any, user: User): Promise<Patient> {
        const patient = this.patientsRepository.create({
            ...createPatientDto,
            // user, // Don't link admin as the patient's user
            // userId: user.id,
        } as unknown as DeepPartial<Patient>);
        return this.patientsRepository.save(patient);
    }

    async findAll(): Promise<Patient[]> {
        return this.patientsRepository.find({ relations: ['user'] });
    }

    async findOne(id: number): Promise<Patient | null> {
        return this.patientsRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async findByUserId(userId: number): Promise<Patient | null> {
        return this.patientsRepository.findOne({ where: { userId }, relations: ['user'] });
    }
}
