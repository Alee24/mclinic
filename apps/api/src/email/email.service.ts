import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import * as nodemailer from 'nodemailer';

interface EmailQueueItem {
    options: ISendMailOptions;
    retries: number;
    timestamp: Date;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private emailQueue: EmailQueueItem[] = [];
    private isProcessingQueue = false;
    private customTransporter: nodemailer.Transporter | null = null;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 5000; // 5 seconds

    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
        private settingsService: SystemSettingsService,
    ) {
        // Start queue processor
        this.startQueueProcessor();
    }

    private get frontendUrl(): string {
        return this.configService.get('FRONTEND_URL') || 'https://portal.mclinic.co.ke';
    }

    /**
     * Create a custom transporter with dynamic settings
     */
    private async createCustomTransporter(): Promise<nodemailer.Transporter | null> {
        try {
            const host = (await this.settingsService.get('EMAIL_SMTP_HOST'))?.trim();
            if (!host) return null;

            const port = parseInt(await this.settingsService.get('EMAIL_SMTP_PORT') || '587', 10);
            const user = (await this.settingsService.get('EMAIL_SMTP_USER'))?.trim();
            const pass = (await this.settingsService.get('EMAIL_SMTP_PASS'))?.trim();
            const secure = (await this.settingsService.get('EMAIL_SMTP_SECURE')) === 'true';
            const fromName = await this.settingsService.get('EMAIL_SMTP_FROM_NAME') || 'M-Clinic';
            let fromEmail = (await this.settingsService.get('EMAIL_SMTP_FROM_EMAIL'))?.trim() || user;

            // Validate and fix from email - must contain @
            if (fromEmail && !fromEmail.includes('@')) {
                this.logger.warn(`Invalid from email (missing @): ${fromEmail}`);
                fromEmail = user; // Fallback to username which should be a valid email
            }

            if (!user || !pass) {
                this.logger.warn('SMTP credentials not configured in system settings');
                return null;
            }

            if (!fromEmail || !fromEmail.includes('@')) {
                this.logger.error('From email is invalid or missing @ symbol');
                return null;
            }

            const transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: { user, pass },
                defaults: {
                    from: `"${fromName}" <${fromEmail}>`,
                },
                tls: {
                    rejectUnauthorized: false, // For self-signed certificates
                },
                pool: true, // Use connection pooling
                maxConnections: 5,
                maxMessages: 100,
            } as any);


            // Verify connection
            try {
                await transporter.verify();
                this.logger.log(`✓ Custom SMTP transporter verified successfully: ${host}:${port} (${user})`);
            } catch (verifyError: any) {
                this.logger.error(`✗ SMTP Verification Failed for ${host}:${port}`);
                this.logger.error(`  Username: ${user}`);
                this.logger.error(`  Error: ${verifyError.message}`);
                this.logger.error(`  Code: ${verifyError.code || 'N/A'}`);

                // Common error codes
                if (verifyError.code === 'EAUTH') {
                    this.logger.error('  → Authentication failed. Check username/password.');
                } else if (verifyError.code === 'ECONNREFUSED') {
                    this.logger.error('  → Connection refused. Check host/port or firewall.');
                } else if (verifyError.code === 'ETIMEDOUT') {
                    this.logger.error('  → Connection timeout. Check network/firewall.');
                }

                throw verifyError;
            }

            return transporter;
        } catch (error: any) {
            this.logger.error(`Failed to create custom transporter: ${error.message}`);
            return null;
        }
    }

    /**
     * Get or create transporter
     */
    private async getTransporter(): Promise<nodemailer.Transporter> {
        // Try to use custom transporter from settings
        if (!this.customTransporter) {
            this.customTransporter = await this.createCustomTransporter();
        }

        // If custom transporter exists and is valid, use it
        if (this.customTransporter) {
            try {
                await this.customTransporter.verify();
                return this.customTransporter;
            } catch (error) {
                this.logger.warn('Custom transporter verification failed, recreating...');
                this.customTransporter = await this.createCustomTransporter();
                if (this.customTransporter) {
                    return this.customTransporter;
                }
            }
        }

        // Fallback to default mailer service transporter
        this.logger.log('Using default environment SMTP configuration');
        return (this.mailerService as any).transporter;
    }

    /**
     * Check if email notifications are enabled
     */
    private async isEmailEnabled(): Promise<boolean> {
        const enabled = await this.settingsService.get('EMAIL_NOTIFICATIONS_ENABLED');
        return enabled !== 'false';
    }

    /**
     * Queue processor - processes emails with retry logic
     */
    private async startQueueProcessor() {
        setInterval(async () => {
            if (this.isProcessingQueue || this.emailQueue.length === 0) {
                return;
            }

            this.isProcessingQueue = true;

            while (this.emailQueue.length > 0) {
                const item = this.emailQueue.shift();
                if (!item) continue;

                try {
                    await this.sendEmailDirect(item.options);
                    this.logger.log(`✓ Email sent successfully: ${item.options.subject}`);
                } catch (error) {
                    if (item.retries < this.MAX_RETRIES) {
                        // Retry
                        item.retries++;
                        this.emailQueue.push(item);
                        this.logger.warn(`Retrying email (${item.retries}/${this.MAX_RETRIES}): ${item.options.subject}`);
                    } else {
                        this.logger.error(`✗ Failed to send email after ${this.MAX_RETRIES} retries: ${item.options.subject}`, error.stack);
                    }
                }

                // Small delay between emails
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.isProcessingQueue = false;
        }, this.RETRY_DELAY);
    }

    /**
     * Send email directly (internal use)
     */
    private async sendEmailDirect(options: ISendMailOptions): Promise<void> {
        const transporter = await this.getTransporter();

        // Ensure 'from' is set
        if (!options.from) {
            const fromName = await this.settingsService.get('EMAIL_SMTP_FROM_NAME') || 'M-Clinic';
            const fromEmail = (await this.settingsService.get('EMAIL_SMTP_FROM_EMAIL'))?.trim() ||
                this.configService.get('SMTP_FROM_EMAIL') ||
                'noreply@mclinic.co.ke';
            options.from = `"${fromName}" <${fromEmail}>`;
        }

        await transporter.sendMail(options);
    }

    /**
     * Main method to send email (with queueing)
     */
    private async sendMail(options: ISendMailOptions, priority: boolean = false): Promise<{ success: boolean; error?: any }> {
        try {
            // Check if emails are enabled
            if (!await this.isEmailEnabled() && !priority) {
                this.logger.log(`Email suppressed (disabled): ${options.subject}`);
                return { success: false, error: 'Email notifications disabled' };
            }

            // Validate recipient
            if (!options.to) {
                throw new Error('No recipient specified');
            }

            // Add to queue
            this.emailQueue.push({
                options,
                retries: 0,
                timestamp: new Date(),
            });

            this.logger.log(`Email queued: ${options.subject} → ${options.to}`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to queue email: ${error.message}`, error.stack);
            return { success: false, error };
        }
    }

    /**
     * Send email with template
     */
    private async sendTemplateEmail(
        to: string,
        subject: string,
        template: string,
        context: any,
        priority: boolean = false
    ): Promise<{ success: boolean; error?: any }> {
        return this.sendMail({
            to,
            subject,
            template: `./${template}`,
            context: {
                ...context,
                frontendUrl: this.frontendUrl,
                currentYear: new Date().getFullYear(),
                supportEmail: 'support@mclinic.co.ke',
                supportPhone: '+254 700 448 448',
            },
        }, priority);
    }

    // ==================== PUBLIC EMAIL METHODS ====================

    async sendAccountCreationEmail(user: any, role: string) {
        return this.sendTemplateEmail(
            user.email,
            'Welcome to M-Clinic Health',
            'account-creation',
            {
                name: `${user.fname} ${user.lname}`,
                role: role,
                isMedic: ['doctor', 'medic', 'nurse', 'clinician', 'pharmacy', 'lab_tech'].includes(role.toLowerCase()),
                loginUrl: `${this.frontendUrl}/login`,
                dashboardUrl: `${this.frontendUrl}/dashboard`,
            }
        );
    }

    async sendLoginAttemptEmail(user: any, ipAddress: string, location: string) {
        return this.sendTemplateEmail(
            user.email,
            'New Login to Your M-Clinic Account',
            'login-attempt',
            {
                name: `${user.fname} ${user.lname}`,
                ipAddress,
                location,
                timestamp: new Date().toLocaleString(),
                dashboardUrl: `${this.frontendUrl}/dashboard`,
            }
        );
    }

    async sendPasswordResetEmail(user: any, resetToken: string) {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
        return this.sendTemplateEmail(
            user.email,
            'Reset Your M-Clinic Password',
            'password-reset',
            {
                name: `${user.fname} ${user.lname}`,
                resetUrl,
                expiryHours: 1,
            },
            true // Priority email
        );
    }

    async sendAppointmentConfirmation(appointment: any) {
        const patientEmail = appointment.patient?.email;
        const doctorEmail = appointment.doctor?.email;

        if (patientEmail) {
            await this.sendTemplateEmail(
                patientEmail,
                'Appointment Confirmed - M-Clinic',
                'appointment-confirmation',
                {
                    patientName: `${appointment.patient.fname} ${appointment.patient.lname}`,
                    doctorName: `Dr. ${appointment.doctor?.fname || 'Provider'}`,
                    appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
                    appointmentTime: appointment.appointmentTime,
                    serviceType: appointment.service?.name || 'Medical Consultation',
                    appointmentId: appointment.id,
                    dashboardUrl: `${this.frontendUrl}/dashboard/appointments`,
                }
            );
        }

        if (doctorEmail) {
            await this.sendTemplateEmail(
                doctorEmail,
                'New Appointment Scheduled',
                'appointment-notification-doctor',
                {
                    doctorName: `Dr. ${appointment.doctor.fname}`,
                    patientName: `${appointment.patient.fname} ${appointment.patient.lname}`,
                    appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
                    appointmentTime: appointment.appointmentTime,
                    serviceType: appointment.service?.name || 'Medical Consultation',
                    dashboardUrl: `${this.frontendUrl}/dashboard/appointments`,
                }
            );
        }
    }

    async sendAppointmentReminder(appointment: any) {
        return this.sendTemplateEmail(
            appointment.patient.email,
            'Appointment Reminder - M-Clinic',
            'appointment-reminder',
            {
                patientName: `${appointment.patient.fname} ${appointment.patient.lname}`,
                doctorName: `Dr. ${appointment.doctor?.fname || 'Provider'}`,
                appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
                appointmentTime: appointment.appointmentTime,
                dashboardUrl: `${this.frontendUrl}/dashboard/appointments`,
            }
        );
    }

    async sendInvoiceEmail(invoice: any, recipientEmail: string) {
        return this.sendTemplateEmail(
            recipientEmail,
            `Invoice ${invoice.invoiceNumber} - M-Clinic`,
            'invoice',
            {
                invoiceNumber: invoice.invoiceNumber,
                customerName: invoice.customerName,
                totalAmount: invoice.totalAmount,
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon receipt',
                items: invoice.items,
                invoiceUrl: `${this.frontendUrl}/dashboard/invoices/${invoice.id}`,
            }
        );
    }

    async sendPaymentConfirmation(payment: any, recipientEmail: string) {
        return this.sendTemplateEmail(
            recipientEmail,
            'Payment Received - M-Clinic',
            'payment-confirmation',
            {
                amount: payment.amount,
                paymentMethod: payment.method || 'M-Pesa',
                transactionId: payment.reference,
                date: new Date().toLocaleDateString(),
                dashboardUrl: `${this.frontendUrl}/dashboard/invoices`,
            }
        );
    }

    // Alias for sendAppointmentConfirmation (backward compatibility)
    async sendBookingConfirmationEmail(appointment: any) {
        return this.sendAppointmentConfirmation(appointment);
    }

    // Alias for doctor notification (backward compatibility)
    async sendAppointmentNotificationToDoctor(appointment: any) {
        const doctorEmail = appointment.doctor?.email;
        if (doctorEmail) {
            return this.sendTemplateEmail(
                doctorEmail,
                'New Appointment Scheduled',
                'appointment-notification-doctor',
                {
                    doctorName: `Dr. ${appointment.doctor.fname}`,
                    patientName: `${appointment.patient.fname} ${appointment.patient.lname}`,
                    appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
                    appointmentTime: appointment.appointmentTime,
                    serviceType: appointment.service?.name || 'Medical Consultation',
                    dashboardUrl: `${this.frontendUrl}/dashboard/appointments`,
                }
            );
        }
    }

    async sendDoctorApprovalEmail(doctor: any, status: 'approved' | 'rejected', reason?: string) {
        const subject = status === 'approved'
            ? 'Your M-Clinic Provider Account Has Been Approved'
            : 'M-Clinic Provider Application Update';

        return this.sendTemplateEmail(
            doctor.email,
            subject,
            status === 'approved' ? 'doctor-approved' : 'doctor-rejected',
            {
                doctorName: `Dr. ${doctor.fname} ${doctor.lname}`,
                status: status,
                reason: reason || '',
                loginUrl: `${this.frontendUrl}/login`,
                dashboardUrl: `${this.frontendUrl}/dashboard`,
            },
            true // Priority
        );
    }

    async sendAccountReactivatedEmail(doctor: any) {
        return this.sendTemplateEmail(
            doctor.email,
            'Your M-Clinic Account Has Been Reactivated',
            'account-reactivated',
            {
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                loginUrl: `${this.frontendUrl}/login`,
                dashboardUrl: `${this.frontendUrl}/dashboard`,
            }
        );
    }

    async sendLicenseExpiryWarning(doctor: any, daysRemaining: number) {
        return this.sendTemplateEmail(
            doctor.email,
            `License Expiry Warning - ${daysRemaining} Days Remaining`,
            'license-expiry-warning',
            {
                doctorName: `Dr. ${doctor.fname} ${doctor.lname}`,
                daysRemaining: daysRemaining,
                expiryDate: doctor.licenseExpiryDate ? new Date(doctor.licenseExpiryDate).toLocaleDateString() : 'Unknown',
                dashboardUrl: `${this.frontendUrl}/dashboard/profile`,
            },
            true // Priority
        );
    }

    async sendLabResultsReadyEmail(patient: any, order: any, testName: string) {
        return this.sendTemplateEmail(
            patient.email,
            'Your Lab Results Are Ready - M-Clinic',
            'lab-results-ready',
            {
                patientName: `${patient.fname} ${patient.lname}`,
                testName: testName,
                orderNumber: order.orderNumber || order.id,
                resultsUrl: `${this.frontendUrl}/dashboard/lab-results`,
            }
        );
    }

    async sendTestEmail(to: string): Promise<{ success: boolean; message?: string; error?: any }> {
        try {
            const result = await this.sendMail({
                to,
                subject: 'M-Clinic Email Test',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #00C65E;">✓ Email Configuration Test Successful!</h2>
                        <p>This is a test email from M-Clinic Health Platform.</p>
                        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                            M-Clinic Health Platform<br>
                            Email: support@mclinic.co.ke<br>
                            Phone: +254 700 448 448
                        </p>
                    </div>
                `,
            }, true); // Priority

            if (result.success) {
                return { success: true, message: 'Test email sent successfully' };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            this.logger.error('Test email failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get email queue status
     */
    getQueueStatus() {
        return {
            queueLength: this.emailQueue.length,
            isProcessing: this.isProcessingQueue,
            hasCustomTransporter: !!this.customTransporter,
        };
    }

    /**
     * Clear email queue (admin only)
     */
    clearQueue() {
        const count = this.emailQueue.length;
        this.emailQueue = [];
        this.logger.warn(`Email queue cleared: ${count} emails removed`);
        return { cleared: count };
    }
}
