import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportRequest, SupportRequestStatus } from './entities/support-request.entity';
import { NotificationService } from '../notification/notification.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class SupportService {
    private readonly logger = new Logger(SupportService.name);

    // Admin numbers that receive SMS alerts for new support requests
    private readonly ADMIN_SMS_NUMBERS = ['254724454757', '254700448448'];

    constructor(
        @InjectRepository(SupportRequest)
        private readonly supportRepo: Repository<SupportRequest>,
        private readonly notificationService: NotificationService,
        private readonly smsService: SmsService
    ) { }

    async create(createSupportDto: { name?: string; email?: string; mobile?: string; message: string }) {
        const request = this.supportRepo.create(createSupportDto);
        const stored = await this.supportRepo.save(request);

        // Notify Admin via email (Non-blocking failure)
        try {
            const contact = request.mobile || request.email || request.name || 'Unknown';
            await this.notificationService.notifyAdmin(
                'support_request',
                `New Support Request from ${contact}: ${request.message.substring(0, 50)}...`
            );
        } catch (error) {
            this.logger.error('Failed to notify admin about support request', error);
        }

        // SMS Alert to admin numbers on new support request
        try {
            const contactName = request.name || 'Unknown';
            const contactInfo = request.mobile || request.email || 'No contact';
            const smsMessage = `[M-Clinic Support] New request from ${contactName} (${contactInfo}): ${request.message.substring(0, 100)}`;

            for (const adminNumber of this.ADMIN_SMS_NUMBERS) {
                try {
                    await this.smsService.sendSms(adminNumber, smsMessage);
                    this.logger.log(`Support SMS alert sent to admin ${adminNumber}`);
                } catch (e) {
                    this.logger.error(`Failed to send support SMS alert to ${adminNumber}`, e);
                }
            }
        } catch (error) {
            this.logger.error('Failed to send SMS alerts to admins for support request', error);
        }

        return stored;
    }

    async findAll() {
        return this.supportRepo.find({ order: { createdAt: 'DESC' } });
    }

    async updateStatus(id: string, status: SupportRequestStatus, response?: string) {
        const request = await this.supportRepo.findOneBy({ id });
        if (request) {
            request.status = status;
            if (response) {
                request.adminResponse = response;

                // Send SMS reply to the customer if they provided a mobile number
                if (request.mobile) {
                    try {
                        const formatted = this.smsService.formatMobile(request.mobile);
                        if (formatted) {
                            await this.smsService.sendSms(formatted, `[M-Clinic Support] ${response}`);
                            this.logger.log(`Support reply SMS sent to customer ${formatted}`);
                        } else {
                            this.logger.warn(`Could not format customer mobile number: ${request.mobile}`);
                        }
                    } catch (e) {
                        this.logger.error(`Failed to send SMS response to ${request.mobile}`, e);
                    }
                }
            }
            return this.supportRepo.save(request);
        }
        return null;
    }
}
