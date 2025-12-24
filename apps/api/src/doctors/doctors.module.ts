import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { Doctor } from './entities/doctor.entity';
import { DoctorSchedule } from '../doctor-schedules/entities/doctor-schedule.entity';
import { DoctorLicence } from '../doctor-licences/entities/doctor-licence.entity';

import { Appointment } from '../appointments/entities/appointment.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Doctor, DoctorSchedule, DoctorLicence, Appointment]), UsersModule],
    controllers: [DoctorsController],
    providers: [DoctorsService],
    exports: [DoctorsService],
})
export class DoctorsModule { }
