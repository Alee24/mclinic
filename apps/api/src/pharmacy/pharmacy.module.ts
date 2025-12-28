import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { Medication } from './entities/medication.entity';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { DoctorsModule } from '../doctors/doctors.module';
import { FinancialModule } from '../financial/financial.module';

import { PharmacyOrder } from './entities/pharmacy-order.entity';
import { PharmacyOrderItem } from './entities/pharmacy-order-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Medication, Prescription, PrescriptionItem, PharmacyOrder, PharmacyOrderItem]),
        DoctorsModule,
        forwardRef(() => FinancialModule),
    ],
    controllers: [PharmacyController],
    providers: [PharmacyService],
    exports: [PharmacyService],
})
export class PharmacyModule { }
