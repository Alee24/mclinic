import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataDeletionRequestDto } from './dto/create-data-deletion-request.dto';

@Injectable()
export class LegalService {
    constructor(private prisma: PrismaService) { }

    async createDataDeletionRequest(dto: CreateDataDeletionRequestDto) {
        return this.prisma.dataDeletionRequest.create({
            data: {
                email: dto.email,
                reason: dto.reason,
            },
        });
    }

    async getAllRequests() {
        return this.prisma.dataDeletionRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getRequestById(id: number) {
        return this.prisma.dataDeletionRequest.findUnique({
            where: { id },
        });
    }
}
