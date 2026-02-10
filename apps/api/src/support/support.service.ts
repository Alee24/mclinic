import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportRequest, SupportRequestStatus } from './entities/support-request.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SupportService {
    private readonly logger = new Logger(SupportService.name);

    constructor(
        @InjectRepository(SupportRequest)
        private readonly supportRepo: Repository<SupportRequest>,
        private readonly notificationService: NotificationService
    ) { }

    async create(createSupportDto: { email?: string; mobile?: string; message: string }) {
        const request = this.supportRepo.create(createSupportDto);
        const stored = await this.supportRepo.save(request);

        // Notify Admin
        const contact = request.mobile || request.email || 'Unknown';
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
            if (response) request.adminResponse = response;
            return this.supportRepo.save(request);
        }
        return null;
    }
}
