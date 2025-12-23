import { Repository } from 'typeorm';
import { Doctor, VerificationStatus } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
export declare class DoctorsService {
    private doctorsRepository;
    constructor(doctorsRepository: Repository<Doctor>);
    create(createDoctorDto: any, user: User): Promise<Doctor>;
    private checkAndExpireLicenses;
    findAllVerified(): Promise<Doctor[]>;
    findAll(): Promise<Doctor[]>;
    findOne(id: number): Promise<Doctor | null>;
    findByUserId(userId: number): Promise<Doctor | null>;
    verifyDoctor(id: number, status: VerificationStatus): Promise<Doctor | null>;
}
