import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsModule } from '../sms/sms.module';
import { CommunicationLog } from './entities/communication-log.entity';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([SystemSetting, CommunicationLog]),
        SmsModule
    ],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService]
})
export class NotificationModule { }
