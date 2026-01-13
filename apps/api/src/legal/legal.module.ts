import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalService } from './legal.service';
import { LegalController } from './legal.controller';
import { DataDeletionRequest } from './entities/data-deletion-request.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DataDeletionRequest])],
    controllers: [LegalController],
    providers: [LegalService],
})
export class LegalModule { }
