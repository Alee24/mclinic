import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportRequestStatus } from './entities/support-request.entity';
import { AuthGuard } from '@nestjs/passport'; // Assumed

@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    // Public endpoint for "Need Help?" form
    @Post()
    create(@Body() body: { email?: string; mobile?: string; message: string }) {
        return this.supportService.create(body);
    }

    // Admin endpoints
    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.supportService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { status: SupportRequestStatus, response?: string }) {
        return this.supportService.updateStatus(id, body.status, body.response);
    }
}
