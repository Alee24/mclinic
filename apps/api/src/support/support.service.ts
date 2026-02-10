import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportRequest, SupportRequestStatus } from './entities/support-request.entity';
import { NotificationService } from '../notification/notification.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class SupportService {
    private readonly logger = new Logger(SupportService.name);

    constructor(
        @InjectRepository(SupportRequest)
        private readonly supportRepo: Repository<SupportRequest>,
        private readonly notificationService: NotificationService,
        private readonly smsService: SmsService
    ) { }

    async create(createSupportDto: { name?: string; email?: string; mobile?: string; message: string }) {
        const request = this.supportRepo.create(createSupportDto);
        const stored = await this.supportRepo.save(request);

        // Notify Admin
        const contact = request.mobile || request.email || request.name || 'Unknown';
        await this.notificationService.notifyAdmin(
            'support_request',
            `New Support Request from ${contact}: ${request.message.substring(0, 50)}...`
        );

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

                // If there's a mobile number, send an SMS response
                if (request.mobile && status === SupportRequestStatus.RESOLVED) {
                    try {
                        const formatted = this.smsService.formatMobile(request.mobile);
                        if (formatted) {
                            await this.smsService.sendSms(formatted, `[M-Clinic Support] ${response}`);
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
