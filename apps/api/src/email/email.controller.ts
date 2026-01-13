import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('test')
    // Temporarily remove auth for debugging - add back after fixing email
    // @UseGuards(JwtAuthGuard)
    async sendTestEmail(@Body() body: { to?: string }) {
        const recipient = body.to || 'test@example.com';
        const result = await this.emailService.sendTestEmail(recipient);

        if (result.success) {
            return {
                success: true,
                message: `Test email sent successfully to ${recipient}`,
            };
        } else {
            return {
                success: false,
                message: 'Failed to send test email',
                error: result.error?.message || result.error,
            };
        }
    }

    @Get('queue-status')
    @UseGuards(JwtAuthGuard)
    async getQueueStatus() {
        return this.emailService.getQueueStatus();
    }

    @Post('clear-queue')
    @UseGuards(JwtAuthGuard)
    async clearQueue() {
        return this.emailService.clearQueue();
    }
}
