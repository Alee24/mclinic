import { Module, Global, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsController } from './sms.controller';
import { CommunicationLog } from '../notification/entities/communication-log.entity';
import { UsersModule } from '../users/users.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Global()
@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([SystemSetting, CommunicationLog]),
        forwardRef(() => UsersModule),
        forwardRef(() => DoctorsModule),
    ],
    providers: [SmsService],
    exports: [SmsService],
    controllers: [SmsController],
})
export class SmsModule { }
