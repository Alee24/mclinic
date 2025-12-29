import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DoctorsService } from '../doctors.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class LicenseCheckService {
    private readonly logger = new Logger(LicenseCheckService.name);

    constructor(
        private doctorsService: DoctorsService,
        private emailService: EmailService,
    ) { }

    // Run daily at midnight
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkLicenseExpiry() {
        this.logger.log('Running daily license expiry check...');

        try {
            // Check and update all license statuses
            await this.doctorsService.checkLicenseStatus();

            // Get doctors with expiring licenses (7 days warning)
            const expiringDoctors = await this.doctorsService.getExpiringSoonLicenses();

            // Send warning emails
            for (const doctor of expiringDoctors) {
                if (!doctor.licenseExpiryDate) continue;

                const daysRemaining = Math.ceil(
                    (new Date(doctor.licenseExpiryDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                try {
                    await this.emailService.sendLicenseExpiryWarning(doctor, daysRemaining);
                    this.logger.log(`Sent expiry warning to doctor ${doctor.id} (${daysRemaining} days remaining)`);
                } catch (error) {
                    this.logger.error(`Failed to send expiry warning to doctor ${doctor.id}:`, error);
                }
            }

            this.logger.log('License expiry check completed');
        } catch (error) {
            this.logger.error('Error during license expiry check:', error);
        }
    }

    // Run every hour to check for newly expired licenses
    @Cron(CronExpression.EVERY_HOUR)
    async checkExpiredLicenses() {
        this.logger.log('Checking for expired licenses...');

        try {
            await this.doctorsService.checkLicenseStatus();
            this.logger.log('Expired license check completed');
        } catch (error) {
            this.logger.error('Error checking expired licenses:', error);
        }
    }
}
