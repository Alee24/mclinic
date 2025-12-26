import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalProfile } from './entities/medical-profile.entity';
import { MedicalProfilesService } from './medical-profiles.service';
import { MedicalProfilesController } from './medical-profiles.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([MedicalProfile]), UsersModule],
    controllers: [MedicalProfilesController],
    providers: [MedicalProfilesService],
    exports: [MedicalProfilesService],
})
export class MedicalProfilesModule { }
