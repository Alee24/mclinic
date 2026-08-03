import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsController } from './sms.controller';
import { CommunicationLog } from '../notification/entities/communication-log.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([SystemSetting, CommunicationLog]),
    ],
    providers: [SmsService],
    exports: [SmsService],
    controllers: [SmsController],
})
export class SmsModule { }
