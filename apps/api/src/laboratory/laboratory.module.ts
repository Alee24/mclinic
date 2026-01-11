import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';
import { LabTest } from './entities/lab-test.entity';
import { LabOrder } from './entities/lab-order.entity';
import { LabResult } from './entities/lab-result.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [TypeOrmModule.forFeature([LabTest, LabOrder, LabResult, User]), EmailModule],
    controllers: [LaboratoryController],
    providers: [LaboratoryService],
})
export class LaboratoryModule { }
