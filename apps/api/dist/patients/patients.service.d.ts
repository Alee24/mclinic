import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';
export declare class PatientsService {
    private patientsRepository;
    constructor(patientsRepository: Repository<Patient>);
    create(createPatientDto: any, user: User): Promise<Patient>;
    findAll(): Promise<Patient[]>;
    findOne(id: number): Promise<Patient | null>;
    findByUserId(userId: number): Promise<Patient | null>;
}
