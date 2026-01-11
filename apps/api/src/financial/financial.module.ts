import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { PaymentConfig } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction } from './entities/transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';

import { Wallet } from '../wallets/entities/wallet.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { MpesaModule } from '../mpesa/mpesa.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentConfig,
      ServicePrice,
      Transaction,
      Invoice,
      InvoiceItem,
      Wallet,
      Doctor,
    ]),
    WalletsModule,
    MpesaModule,
  ],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule { }
