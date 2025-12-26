import { Repository } from 'typeorm';
import { MedicalProfile } from './entities/medical-profile.entity';
import { UsersService } from '../users/users.service';
export declare class MedicalProfilesService {
    private repo;
    private usersService;
    constructor(repo: Repository<MedicalProfile>, usersService: UsersService);
    findByUserId(userId: number): Promise<MedicalProfile>;
    update(userId: number, dto: any): Promise<MedicalProfile>;
}
