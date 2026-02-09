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
            ) as any;

            if (response.data && response.data.responses && response.data.responses[0]['response-code'] === 200) {
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

    // Helper to format mobile numbers to 254...
    formatMobile(mobile: string): string | null {
        if (!mobile) return null;

        // Remove all non-digit characters
        let cleaned = mobile.replace(/\D/g, '');

        // Handle various formats
        if (cleaned.startsWith('254')) {
            // Already in 254 format, ensure length is 12
            if (cleaned.length === 12) return cleaned;
        } else if (cleaned.startsWith('01') || cleaned.startsWith('07')) {
            // Local format 07xx or 01xx -> 2547xx or 2541xx
            if (cleaned.length === 10) return '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('1') || cleaned.startsWith('7')) {
            // Missing leading 0 or 254 -> assume 254 if length is 9
            if (cleaned.length === 9) return '254' + cleaned;
        }

        // If it fits the pattern, return it, otherwise null
        // Basic validation: must be 12 digits starting with 254
        if (cleaned.startsWith('254') && cleaned.length === 12) return cleaned;

        return null;
    }

    async sendBulkSms(recipients: string[], message: string): Promise<{ total: number, sent: number, failed: number }> {
        const creds = await this.getCredentials();
        if (!creds) return { total: recipients.length, sent: 0, failed: recipients.length };

        // Pre-construct the base payload
        const basePayload = {
            apikey: creds.apiKey,
            partnerID: creds.partnerID,
            message: message,
            shortcode: creds.shortcode,
        };

        let sentCount = 0;
        let failedCount = 0;

        // Dedup and clean recipients
        const uniqueMobiles = [...new Set(recipients)];

        // Process in chunks if needed, but for now simple loop
        for (const mobile of uniqueMobiles) {
            const formatted = this.formatMobile(mobile);
            if (formatted) {
                try {
                    const payload = { ...basePayload, mobile: formatted };
                    // We bypass sendSms to use the cached credentials
                    const response = await firstValueFrom(
                        this.httpService.post(this.API_URL, payload)
                    ) as any;

                    if (response.data && response.data.responses && response.data.responses[0]['response-code'] === 200) {
                        sentCount++;
                    } else {
                        failedCount++;
                        this.logger.error(`Bulk SMS Error for ${formatted}: ${JSON.stringify(response.data)}`);
                    }
                } catch (e) {
                    failedCount++;
                    this.logger.error(`Bulk SMS Failed for ${formatted}`, e);
                }
            } else {
                failedCount++;
            }
        }

        this.logger.log(`Bulk SMS Summary: Sent: ${sentCount}, Failed: ${failedCount}`);
        return { total: uniqueMobiles.length, sent: sentCount, failed: failedCount };
    }

    // OTP Logic placeholder - will be extended when integrating with Auth
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
