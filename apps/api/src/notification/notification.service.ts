import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private readonly DEFAULT_ADMIN_MOBILE = '0724454757';

    constructor(
        @InjectRepository(SystemSetting)
        private readonly settingsRepo: Repository<SystemSetting>,
        private readonly smsService: SmsService,
    ) { }

    private async getSetting(key: string): Promise<string | null> {
        const setting = await this.settingsRepo.findOne({ where: { key } });
        return setting ? setting.value : null;
    }

    private async getAdminMobile(): Promise<string> {
        const mobile = await this.getSetting('admin_notification_mobile');
        return mobile || this.DEFAULT_ADMIN_MOBILE;
    }

    private async shouldNotify(key: string): Promise<boolean> {
        const value = await this.getSetting(key);
        return value === 'true' || value === '1';
    }

    async notifyAdmin(type: 'signup' | 'booking' | 'payment_failure' | 'support_request' | 'reset', message: string) {
        let settingKey = '';
        switch (type) {
            case 'signup': settingKey = 'notify_on_signup'; break;
            case 'booking': settingKey = 'notify_on_booking'; break;
            case 'payment_failure': settingKey = 'notify_on_payment_failure'; break;
            case 'support_request': settingKey = 'notify_on_support_request'; break;
            case 'reset': settingKey = 'notify_on_reset'; break; // Optional if needed
        }

        if (settingKey && !(await this.shouldNotify(settingKey))) {
            this.logger.log(`Skipping admin notification for ${type} (disabled in settings)`);
            return;
        }

        const adminMobile = await this.getAdminMobile();
        const formattedMobile = this.smsService.formatMobile(adminMobile);

        if (formattedMobile) {
            this.logger.log(`Sending Admin Notification to ${formattedMobile}: ${message}`);
            await this.smsService.sendSms(formattedMobile, `[Admin Alert] ${message}`);
        } else {
            this.logger.warn(`Invalid Admin Mobile: ${adminMobile}`);
        }
    }
}
