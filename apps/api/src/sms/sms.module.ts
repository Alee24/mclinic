import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsController } from './sms.controller';
import { UsersModule } from '../users/users.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([SystemSetting]),
        UsersModule,
        DoctorsModule
    ],
    providers: [SmsService],
    exports: [SmsService],
    controllers: [SmsController],
})
export class SmsModule { }
