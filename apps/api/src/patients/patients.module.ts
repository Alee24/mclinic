import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { User } from '../users/entities/user.entity';
import { Patient } from './entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Patient])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule { }
