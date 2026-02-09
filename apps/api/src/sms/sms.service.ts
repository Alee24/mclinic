import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private readonly API_URL = 'https://quicksms.advantasms.com/api/services/sendsms'; // Replace with actual URL from user or config if different

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(SystemSetting)
        private readonly settingsRepo: Repository<SystemSetting>,
    ) { }

    private async getCredentials() {
        const settings = await this.settingsRepo.find({
            where: [
                { key: 'sms_api_key' },
                { key: 'sms_partner_id' },
                { key: 'sms_shortcode' }
            ]
        });

        const apiKey = settings.find(s => s.key === 'sms_api_key')?.value;
        const partnerID = settings.find(s => s.key === 'sms_partner_id')?.value;
        const shortcode = settings.find(s => s.key === 'sms_shortcode')?.value;

        if (!apiKey || !partnerID || !shortcode) {
            this.logger.warn('SMS Credentials not configured');
            return null;
        }

        return { apiKey, partnerID, shortcode };
    }

    async sendSms(mobile: string, message: string): Promise<boolean> {
        const creds = await this.getCredentials();
        if (!creds) return false;

        try {
            const payload = {
                apikey: creds.apiKey,
                partnerID: creds.partnerID,
                message: message,
                shortcode: creds.shortcode,
                mobile: mobile
            };

            this.logger.log(`Sending SMS to ${mobile}`);

            const response = await firstValueFrom(
                this.httpService.post(this.API_URL, payload)
            );

            if (response.data.responses && response.data.responses[0]['response-code'] === 200) {
                this.logger.log(`SMS sent successfully to ${mobile}`);
                return true;
            } else {
                this.logger.error(`SMS API Error: ${JSON.stringify(response.data)}`);
                return false;
            }

        } catch (error) {
            this.logger.error(`Failed to send SMS to ${mobile}`, error);
            return false;
        }
    }

    // OTP Logic placeholder - will be extended when integrating with Auth
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
