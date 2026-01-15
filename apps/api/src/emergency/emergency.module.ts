import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyAlert } from './entities/emergency-alert.entity';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmergencyAlert]),
        DoctorsModule
    ],
    controllers: [EmergencyController],
    providers: [EmergencyService],
    exports: [EmergencyService],
})
export class EmergencyModule { }
