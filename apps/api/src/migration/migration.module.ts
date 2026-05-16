import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Invoice } from '../financial/entities/invoice.entity';
import { Transaction } from '../financial/entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Medication } from '../pharmacy/entities/medication.entity';
import { LabTest } from '../laboratory/entities/lab-test.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Doctor, Appointment, Invoice, Transaction, Wallet, Medication, LabTest]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}
