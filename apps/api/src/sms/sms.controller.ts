import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SmsService } from './sms.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { UserRole } from '../users/entities/user.entity';

@Controller('sms')
export class SmsController {
    constructor(
        private readonly smsService: SmsService,
        private readonly usersService: UsersService,
        private readonly doctorsService: DoctorsService
    ) { }

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

    @UseGuards(AuthGuard('jwt'))
    @Post('bulk')
    async sendBulkSms(@Body() body: { recipientType: 'medic' | 'patient' | 'all'; message: string }) {
        if (!body.message) {
            throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
        }

        let recipients: string[] = [];

        if (body.recipientType === 'medic') {
            // Fetch all verified doctors/medics
            const doctors = await this.doctorsService.findAllVerified();
            recipients = doctors.map(d => d.mobile).filter(m => m);
        } else if (body.recipientType === 'patient') {
            // Fetch all patients
            const allUsers = await this.usersService.findAll();
            recipients = allUsers
                .filter(u => u.role === UserRole.PATIENT && u.mobile)
                .map(u => u.mobile);
        } else if (body.recipientType === 'all') {
            // Fetch everyone
            const allUsers = await this.usersService.findAll();
            // Also get doctors just in case some are not in users table (though they should be synced)
            const doctors = await this.doctorsService.findAllVerified();

            const userMobiles = allUsers.map(u => u.mobile).filter(m => m);
            const docMobiles = doctors.map(d => d.mobile).filter(m => m);

            recipients = [...userMobiles, ...docMobiles];
        } else {
            throw new HttpException('Invalid recipient type', HttpStatus.BAD_REQUEST);
        }

        if (recipients.length === 0) {
            return { success: true, message: 'No recipients found for the selected category.', stats: { total: 0, sent: 0, failed: 0 } };
        }

        const result = await this.smsService.sendBulkSms(recipients, body.message);

        return {
            success: true,
            message: `Processed ${result.total} recipients. Sent: ${result.sent}, Failed: ${result.failed}`,
            stats: result
        };
    }
}
