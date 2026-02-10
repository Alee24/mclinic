import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportRequest } from './entities/support-request.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SupportRequest]),
        NotificationModule
    ],
    controllers: [SupportController],
    providers: [SupportService]
})
export class SupportModule { }
