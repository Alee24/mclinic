import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createPatientDto: any, user?: User | null): Promise<User> {
        // Generate a default email if not provided
        const email = createPatientDto.email || `patient${Date.now()}@mclinic.temp`;
        const password = createPatientDto.password || 'Patient123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        const patient = this.usersRepository.create({
            email,
            password: hashedPassword,
            role: UserRole.PATIENT,
            ...createPatientDto,
        } as DeepPartial<User>);

        return this.usersRepository.save(patient);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            where: { role: UserRole.PATIENT }
        });
    }

    async findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id, role: UserRole.PATIENT }
        });
    }

    async findByUserId(userId: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id: userId, role: UserRole.PATIENT }
        });
    }
}
