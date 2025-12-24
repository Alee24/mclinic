import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Transaction } from '../financial/entities/transaction.entity';
import { ServicePrice } from '../financial/entities/service-price.entity';
import { Invoice } from '../financial/entities/invoice.entity';
import { InvoiceItem } from '../financial/entities/invoice-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Patient,
            Doctor,
            Appointment,
            MedicalRecord,
            Transaction,
            ServicePrice,
            Invoice,
            InvoiceItem
        ])
    ],
    controllers: [SeedingController],
    providers: [SeedingService],
})
export class SeedingModule { }
