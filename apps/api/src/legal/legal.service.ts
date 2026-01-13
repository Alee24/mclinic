import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataDeletionRequest } from './entities/data-deletion-request.entity';
import { CreateDataDeletionRequestDto } from './dto/create-data-deletion-request.dto';

@Injectable()
export class LegalService {
    constructor(
        @InjectRepository(DataDeletionRequest)
        private requestRepository: Repository<DataDeletionRequest>,
    ) { }

    async createDataDeletionRequest(dto: CreateDataDeletionRequestDto) {
        const request = this.requestRepository.create(dto);
        return this.requestRepository.save(request);
    }

    async getAllRequests() {
        return this.requestRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async getRequestById(id: number) {
        return this.requestRepository.findOne({
            where: { id },
        });
    }
}
