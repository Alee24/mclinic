import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from './entities/patient.entity';
export declare class PatientsService {
    private usersRepository;
    private patientsRepository;
    constructor(usersRepository: Repository<User>, patientsRepository: Repository<Patient>);
    create(createPatientDto: any, user?: User | null): Promise<User>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<User | null>;
    findByUserId(userId: number): Promise<any>;
    update(id: number, updateDto: any): Promise<User | null>;
}
