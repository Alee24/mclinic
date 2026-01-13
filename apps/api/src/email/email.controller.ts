import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('test')
    @UseGuards(AuthGuard('jwt'))
    async sendTestEmail(@Req() req: any, @Body() body: { to?: string }) {
        const email = body.to || req.user.email;
        console.log(`[EMAIL] Test request from ${req.user.email}. Sending to ${email}`);
        return this.emailService.sendTestEmail(email);
    }
}
