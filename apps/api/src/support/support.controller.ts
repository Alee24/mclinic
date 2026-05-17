import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportRequestStatus } from './entities/support-request.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    // Public endpoint for "Need Help?" form
    @Post()
    create(@Body() body: { name?: string; email?: string; mobile?: string; message: string }) {
        return this.supportService.create(body);
    }

    // Admin endpoints
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.supportService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { status: SupportRequestStatus, response?: string }) {
        return this.supportService.updateStatus(id, body.status, body.response);
    }
}
