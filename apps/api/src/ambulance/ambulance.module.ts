import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbulanceSubscription } from './entities/ambulance-subscription.entity';
import { AmbulancePackage } from './entities/ambulance-package.entity';
import { AmbulanceController } from './ambulance.controller';
import { AmbulanceService } from './ambulance.service';
import { FinancialModule } from '../financial/financial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AmbulanceSubscription, AmbulancePackage]),
    FinancialModule,
  ],
  controllers: [AmbulanceController],
  providers: [AmbulanceService]
})
export class AmbulanceModule { }
