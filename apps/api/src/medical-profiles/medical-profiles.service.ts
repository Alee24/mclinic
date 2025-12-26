import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalProfile } from './entities/medical-profile.entity';

import { UsersService } from '../users/users.service';

@Injectable()
export class MedicalProfilesService {
    constructor(
        @InjectRepository(MedicalProfile)
        private repo: Repository<MedicalProfile>,
        private usersService: UsersService,
    ) { }

    async findByUserId(userId: number) {
        let profile = await this.repo.findOne({ where: { user_id: userId } });
        if (!profile) {
            profile = this.repo.create({ user_id: userId });
            await this.repo.save(profile);
        }
        return profile;
    }

    async update(userId: number, dto: any) {
        // If DOB or other User fields are present, update User entity
        if (dto.dob) {
            await this.usersService.update(userId, { dob: dto.dob });
        }

        const profile = await this.findByUserId(userId);
        Object.assign(profile, dto);
        return this.repo.save(profile);
    }
}
