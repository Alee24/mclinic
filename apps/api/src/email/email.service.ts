import { Injectable } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SystemSettingsService } from '../system-settings/system-settings.service';

@Injectable()
export class EmailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
        private settingsService: SystemSettingsService,
    ) { }

    private get frontendUrl(): string {
        return this.configService.get('FRONTEND_URL') || 'https://portal.mclinic.co.ke';
    }

    /**
     * Dynamically configures a transporter based on SystemSettings.
     * Returns 'custom' if settings exist, otherwise returns undefined (default).
     */
    private async getTransporterName(): Promise<string | undefined> {
        let host = await this.settingsService.get('EMAIL_SMTP_HOST');
        if (!host) return undefined; // Use default env config
        host = host.trim();

        const port = await this.settingsService.get('EMAIL_SMTP_PORT');
        let user = await this.settingsService.get('EMAIL_SMTP_USER');
        if (user) user = user.trim();

        let pass = await this.settingsService.get('EMAIL_SMTP_PASS');
        if (pass) pass = pass.trim();

        const secure = (await this.settingsService.get('EMAIL_SMTP_SECURE')) === 'true';
        const fromName = await this.settingsService.get('EMAIL_SMTP_FROM_NAME') || 'M-Clinic Notifications';
        const fromEmail = (await this.settingsService.get('EMAIL_SMTP_FROM_EMAIL'))?.trim() || user;

        const config = {
            host,
            port: port ? parseInt(port, 10) : 587,
            secure,
            auth: { user, pass },
            defaults: {
                from: `"${fromName}" <${fromEmail}>`,
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        // Use 'as any' to bypass potential type definition issues with addTransporter
        (this.mailerService as any).addTransporter('custom', config);
        return 'custom';
    }

    /**
     * Wrapper to send email using the correct transporter.
     */
    private async sendMailWithContext(options: ISendMailOptions, throwError = false) {
        try {
            // Check if master toggle is enabled (default true)
            const enabled = await this.settingsService.get('EMAIL_NOTIFICATIONS_ENABLED');
            if (enabled === 'false' && !throwError) { // Allow test emails to bypass master switch
                console.log(`Email suppressed (Master Switch OFF): ${options.subject}`);
                return;
            }

            const transporterName = await this.getTransporterName();
            const info = await this.mailerService.sendMail({
                ...options,
                transporterName,
            });
            console.log(`Email sent: ${options.subject} to ${options.to} via ${transporterName || 'Default Env'}`);
            return { success: true, info };
        } catch (error) {
            console.error(`Failed to send email (${options.subject}):`, error);
            if (throwError) throw error;
            return { success: false, error: error };
        }
    }

    // ... (rest of methods unchanged until sendTestEmail)

    async sendTestEmail(to: string) {
        try {
            const result = await this.sendMailWithContext({
                to,
                subject: 'Test Email - M-Clinic Configuration',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #00F090;">M-Clinic Email Configuration</h2>
                        <p>Success! Your SMTP settings are working correctly.</p>
                        <p>Time: ${new Date().toLocaleString()}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #666;">If you received this email, the notification system is operational.</p>
                        <p style="font-size: 10px; color: #999;">Debug: Sent via ${await this.getTransporterName() || 'Default Env'}</p>
                    </div>
                `,
            }, true);
            return { success: true, debug: result?.info };
        } catch (error) {
            return { success: false, error: error.message || 'Unknown connection error', stack: error.stack };
        }
    }
}
