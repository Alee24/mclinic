import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LegalService } from './legal.service';
import { CreateDataDeletionRequestDto } from './dto/create-data-deletion-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('legal')
export class LegalController {
    constructor(private readonly legalService: LegalService) { }

    @Post('data-deletion-request')
    async createRequest(@Body() dto: CreateDataDeletionRequestDto) {
        return this.legalService.createDataDeletionRequest(dto);
    }

    @Get('data-deletion-requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getAllRequests() {
        return this.legalService.getAllRequests();
    }
}
