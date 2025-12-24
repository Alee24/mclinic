import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class PatientsService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createPatientDto: any, user?: User | null): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    findByUserId(userId: number): Promise<User | null>;
}
