import { Injectable } from '@nestjs/common';
// Force sync update
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

        const portNum = port ? parseInt(port, 10) : 587;
        // Port 465 is for implicit SSL, Port 587 is for STARTTLS
        const finalSecure = portNum === 465;

        const config = {
            host,
            port: portNum,
            secure: finalSecure,
            auth: { user, pass },
            defaults: {
                from: `"${fromName}" <${fromEmail}>`,
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        console.log(`[EmailService] SMTP Debug: Host=${host}, Port=${config.port}, User=${user}, Secure=${finalSecure}`);

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

    async sendAccountCreationEmail(user: any, role: string) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Welcome to M-Clinic Health',
            template: './account-creation',
            context: {
                name: `${user.fname} ${user.lname}`,
                role: role,
                isMedic: ['doctor', 'medic', 'nurse', 'clinician', 'pharmacy', 'lab_tech'].includes(role.toLowerCase()),
                loginUrl: `${this.frontendUrl}/login`,
                dashboardUrl: `${this.frontendUrl}/dashboard`,
            },
        });
    }

    async sendVerificationEmail(user: any, token: string) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Verify Your Email - M-Clinic Health',
            // template: './email-verification', // Need to create this template, but for now I'll use HTML or generic
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verify Your Email</h2>
                    <p>Hello ${user.fname},</p>
                    <p>Please click the link below to verify your email address:</p>
                    <p>
                        <a href="${this.frontendUrl}/verify-email?token=${token}" style="background-color: #00F090; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    </p>
                    <p>Or copy this link: ${this.frontendUrl}/verify-email?token=${token}</p>
                </div>
            `,
            context: {
                name: `${user.fname} ${user.lname}`,
                verificationUrl: `${this.frontendUrl}/verify-email?token=${token}`,
            },
        });
    }

    async sendPasswordResetEmail(user: any, token: string) {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Reset Your Password - M-Clinic Health',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; line-height: 1.6;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #059669; font-size: 24px; font-weight: 800; margin: 0;">M-CLINIC</h1>
                        <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Advanced Healthcare Portal</p>
                    </div>
                    
                    <div style="background-color: #f9fafb; border-radius: 16px; padding: 30px; border: 1px solid #f3f4f6;">
                        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0;">Password Reset Request</h2>
                        <p>Hello ${user.fname},</p>
                        <p>We received a request to reset the password for your M-Clinic account. Click the button below to set a new password. This link will expire in 1 hour.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Reset My Password</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} M-Clinic Health Kenya. All rights reserved.</p>
                    </div>
                </div>
            `,
            context: {
                name: `${user.fname} ${user.lname}`,
                resetUrl: resetUrl,
            },
        });
    }

    async sendLoginAttemptEmail(user: any, ipAddress: string, location: string) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'New Login to Your M-Clinic Account',
            template: './login-attempt',
            context: {
                name: `${user.fname} ${user.lname}`,
                ipAddress,
                location,
                time: new Date().toLocaleString(),
                dashboardUrl: `${this.frontendUrl}/dashboard`,
            },
        });
    }

    async sendBookingConfirmationEmail(user: any, appointment: any, doctor: any) {
        if ((await this.settingsService.get('EMAIL_BOOKING_CONFIRMATION')) === 'false') return;

        await this.sendMailWithContext({
            to: user.email,
            subject: 'Appointment Confirmation - M-Clinic Health',
            template: './booking-confirmation',
            context: {
                patientName: `${user.fname} ${user.lname}`,
                doctorName: `Dr. ${doctor.fname} ${doctor.lname}`,
                doctorSpecialty: doctor.speciality,
                appointmentDate: new Date(appointment.appointment_date).toLocaleDateString(),
                appointmentTime: appointment.appointment_time,
                service: appointment.service?.name || 'Consultation',
                fee: appointment.fee,
                reason: appointment.reason || null,
                appointmentUrl: `${this.frontendUrl}/dashboard/appointments`,
            },
        });
    }

    async sendAppointmentNotificationToDoctor(doctor: any, appointment: any, patient: any) {
        if ((await this.settingsService.get('EMAIL_BOOKING_NOTIFICATION_MEDIC')) === 'false') return;

        await this.sendMailWithContext({
            to: doctor.email,
            subject: 'New Appointment Scheduled - M-Clinic Health',
            template: './booking-notification-medic',
            context: {
                doctorName: `${doctor.fname} ${doctor.lname}`,
                patientName: `${patient.fname} ${patient.lname}`,
                appointmentDate: new Date(appointment.appointment_date).toLocaleDateString(),
                appointmentTime: appointment.appointment_time,
                service: appointment.service?.name || 'Consultation',
                reason: appointment.reason || null,
                dashboardUrl: `${this.frontendUrl}/dashboard/appointments`,
            },
        });
    }

    async sendBookingReminderEmail(user: any, appointment: any, doctor: any) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Appointment Reminder - Tomorrow',
            template: './appointment-reminder',
            context: {
                patientName: `${user.fname} ${user.lname}`,
                doctorName: `Dr. ${doctor.fname} ${doctor.lname}`,
                appointmentDate: new Date(appointment.appointment_date).toLocaleDateString(),
                appointmentTime: appointment.appointment_time,
                service: appointment.service?.name || 'Consultation',
                appointmentUrl: `${this.frontendUrl}/dashboard/appointments`,
            },
        });
    }

    async sendInvoiceEmail(user: any, invoice: any, items: any[]) {
        if ((await this.settingsService.get('EMAIL_INVOICE_GENERATED')) === 'false') return;

        await this.sendMailWithContext({
            to: user.email,
            subject: `Invoice #${invoice.invoiceNumber} - M-Clinic Health`,
            template: './invoice',
            context: {
                name: `${user.fname} ${user.lname}`,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
                dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                items: items,
                subtotal: invoice.amount,
                total: invoice.amount,
                status: invoice.status,
                invoiceUrl: `${this.frontendUrl}/dashboard/invoices`,
            },
        });
    }

    async sendPaymentConfirmationEmail(user: any, payment: any, invoice: any) {
        if ((await this.settingsService.get('EMAIL_PAYMENT_CONFIRMATION')) === 'false') return;

        await this.sendMailWithContext({
            to: user.email,
            subject: 'Payment Confirmation - M-Clinic Health',
            template: './payment-confirmation',
            context: {
                name: `${user.fname} ${user.lname}`,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                transactionRef: payment.transactionRef || payment.mpesaReceiptNumber,
                invoiceNumber: invoice.invoiceNumber,
                paymentDate: new Date(payment.createdAt).toLocaleDateString(),
                invoiceUrl: `${this.frontendUrl}/dashboard/invoices`,
            },
        });
    }

    async sendPrescriptionReadyEmail(patient: any, prescription: any, doctor: any) {
        if ((await this.settingsService.get('EMAIL_PRESCRIPTION_READY')) === 'false') return;

        await this.sendMailWithContext({
            to: patient.email,
            subject: 'Prescription Ready - M-Clinic Health',
            template: './prescription-ready',
            context: {
                patientName: `${patient.fname} ${patient.lname}`,
                doctorName: `Dr. ${doctor.fname} ${doctor.lname}`,
                prescriptionDate: new Date(prescription.createdAt).toLocaleDateString(),
                medicationCount: prescription.items?.length || 0,
                prescriptionUrl: `${this.frontendUrl}/dashboard/records`,
                pharmacyUrl: `${this.frontendUrl}/dashboard/pharmacy`,
            },
        });
    }

    async sendOrderShippedEmail(user: any, order: any, trackingNumber: string) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Order Shipped - M-Clinic Health Pharmacy',
            template: './order-shipped',
            context: {
                name: `${user.fname} ${user.lname}`,
                orderNumber: order.id,
                trackingNumber: trackingNumber,
                estimatedDelivery: '2-3 business days',
                orderUrl: `${this.frontendUrl}/dashboard/pharmacy`,
                deliveryAddress: order.deliveryAddress,
            },
        });
    }

    async sendAppointmentCancellationEmail(user: any, appointment: any, reason: string) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Appointment Cancelled - M-Clinic Health',
            template: './appointment-cancellation',
            context: {
                name: `${user.fname} ${user.lname}`,
                appointmentDate: new Date(appointment.appointment_date).toLocaleDateString(),
                appointmentTime: appointment.appointment_time,
                reason: reason,
                bookNewUrl: `${this.frontendUrl}/dashboard/appointments`,
            },
        });
    }

    async sendLabResultsReadyEmail(user: any, order: any, testName: string) {
        if ((await this.settingsService.get('EMAIL_LAB_RESULTS_READY')) === 'false') return;

        await this.sendMailWithContext({
            to: user.email,
            subject: 'Lab Results Ready - M-Clinic Health',
            template: './lab-results-ready',
            context: {
                name: user.role === 'patient' ? user.fname : (order.beneficiaryName || user.fname),
                testName: testName,
                resultsUrl: `${this.frontendUrl}/dashboard/lab`,
                reportUrl: order.report_url ? `${process.env.API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/reports/${order.report_url}` : null,
                notes: order.technicianNotes,
                year: new Date().getFullYear(),
            },
        });
    }

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
