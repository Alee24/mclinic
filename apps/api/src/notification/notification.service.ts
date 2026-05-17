import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { SmsService } from '../sms/sms.service';
import { CommunicationLog, CommunicationType } from './entities/communication-log.entity';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private readonly DEFAULT_ADMIN_MOBILE = '0724454757';
    private readonly CC_MOBILE = '254700448448';

    constructor(
        @InjectRepository(SystemSetting)
        private readonly settingsRepo: Repository<SystemSetting>,
        @InjectRepository(CommunicationLog)
        private readonly commsLogRepo: Repository<CommunicationLog>,
        private readonly smsService: SmsService,
    ) { }

    async getStats() {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        const stats = await this.commsLogRepo.createQueryBuilder('log')
            .select('log.type', 'type')
            .addSelect('COUNT(*)', 'cumulative')
            .addSelect('SUM(CASE WHEN log.createdAt >= :startOfDay THEN 1 ELSE 0 END)', 'today')
            .setParameter('startOfDay', startOfDay)
            .groupBy('log.type')
            .getRawMany();

        const result = {
            email: { today: 0, cumulative: 0 },
            sms: { today: 0, cumulative: 0 }
        };

        stats.forEach(s => {
            if (s.type === CommunicationType.EMAIL) {
                result.email = { today: parseInt(s.today) || 0, cumulative: parseInt(s.cumulative) || 0 };
            } else if (s.type === CommunicationType.SMS) {
                result.sms = { today: parseInt(s.today) || 0, cumulative: parseInt(s.cumulative) || 0 };
            }
        });

        return result;
    }

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
        // Default to true for robust alert notifications, unless explicitly set to false/0
        return value !== 'false' && value !== '0';
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
            this.logger.log(`Sending Admin Notification to ${formattedMobile}`);
            await this.smsService.sendSms(formattedMobile, message);
        } else {
            this.logger.warn(`Invalid Admin Mobile: ${adminMobile}`);
        }

        this.logger.log(`Sending Admin Notification to ${this.CC_MOBILE}`);
        await this.smsService.sendSms(this.CC_MOBILE, message);
    }

    async sendCustomSms(mobile: string, message: string) {
        const formatted = this.smsService.formatMobile(mobile);
        if (formatted) {
            await this.smsService.sendSms(formatted, message);
        }
    }
}
