import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([SystemSetting])
    ],
    providers: [SmsService],
    exports: [SmsService],
})
export class SmsModule { }
