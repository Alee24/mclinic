import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { MpesaTransaction } from './entities/mpesa-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([MpesaTransaction]),
        ConfigModule,
    ],
    controllers: [MpesaController],
    providers: [MpesaService],
    exports: [MpesaService],
})
export class MpesaModule { }
