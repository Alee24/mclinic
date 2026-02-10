import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsModule } from '../sms/sms.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([SystemSetting]),
        SmsModule
    ],
    providers: [NotificationService],
    exports: [NotificationService]
})
export class NotificationModule { }
