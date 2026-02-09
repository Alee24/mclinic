import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SmsService } from './sms.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('sms')
export class SmsController {
    constructor(private readonly smsService: SmsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('test')
    async sendTestSms(@Body() body: { mobile: string; message?: string }) {
        if (!body.mobile) {
            throw new HttpException('Mobile number is required', HttpStatus.BAD_REQUEST);
        }

        const message = body.message || 'This is a test SMS from M-Clinic system.';
        const result = await this.smsService.sendSms(body.mobile, message);

        if (result) {
            return { success: true, message: 'SMS sent successfully' };
        } else {
            return { success: false, message: 'Failed to send SMS. Check logs/credentials.' };
        }
    }
}
