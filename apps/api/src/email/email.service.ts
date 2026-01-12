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
        const host = await this.settingsService.get('EMAIL_SMTP_HOST');
        if (!host) return undefined; // Use default env config

        const port = await this.settingsService.get('EMAIL_SMTP_PORT');
        const user = await this.settingsService.get('EMAIL_SMTP_USER');
        const pass = await this.settingsService.get('EMAIL_SMTP_PASS');
        const secure = (await this.settingsService.get('EMAIL_SMTP_SECURE')) === 'true';
        const fromName = await this.settingsService.get('EMAIL_SMTP_FROM_NAME') || 'M-Clinic Notifications';
        const fromEmail = await this.settingsService.get('EMAIL_SMTP_FROM_EMAIL') || user;

        const config = {
            host,
            port: port ? parseInt(port, 10) : 587,
            secure,
            auth: { user, pass },
            defaults: {
                from: `"${fromName}" <${fromEmail}>`,
            },
        };

        // Use 'as any' to bypass potential type definition issues with addTransporter
        (this.mailerService as any).addTransporter('custom', config);
        return 'custom';
    }

    /**
     * Wrapper to send email using the correct transporter.
     */
    private async sendMailWithContext(options: ISendMailOptions) {
        try {
            // Check if master toggle is enabled (default true)
            const enabled = await this.settingsService.get('EMAIL_NOTIFICATIONS_ENABLED');
            if (enabled === 'false') {
                console.log(`Email suppressed (Master Switch OFF): ${options.subject}`);
                return;
            }

            const transporterName = await this.getTransporterName();
            await this.mailerService.sendMail({
                ...options,
                transporterName,
            });
            console.log(`Email sent: ${options.subject} to ${options.to} via ${transporterName || 'Default Env'}`);
        } catch (error) {
            console.error(`Failed to send email (${options.subject}):`, error);
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

    async sendDoctorApprovalEmail(doctor: any, status: 'approved' | 'rejected', reason?: string) {
        await this.sendMailWithContext({
            to: doctor.email,
            subject: status === 'approved' ? 'Account Approved - M-Clinic Health' : 'Account Application Update',
            template: './doctor-approval',
            context: {
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                status: status,
                reason: reason || '',
                dashboardUrl: `${this.frontendUrl}/dashboard`,
                supportEmail: process.env.SMTP_FROM_EMAIL || 'support@mclinic.co.ke',
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

    async sendPasswordResetEmail(user: any, resetToken: string) {
        await this.sendMailWithContext({
            to: user.email,
            subject: 'Password Reset Request - M-Clinic Health',
            template: './password-reset',
            context: {
                name: `${user.fname} ${user.lname}`,
                resetUrl: `${this.frontendUrl}/reset-password?token=${resetToken}`,
                expiryTime: '1 hour',
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

    async sendLicenseExpiryWarning(doctor: any, daysRemaining: number) {
        if ((await this.settingsService.get('EMAIL_LICENSE_EXPIRY_WARNING')) === 'false') return;

        await this.sendMailWithContext({
            to: doctor.email,
            subject: `License Expiry Warning - ${daysRemaining} Days Remaining`,
            template: './license-expiry-warning',
            context: {
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                daysRemaining: daysRemaining,
                expiryDate: new Date(doctor.licenseExpiryDate).toLocaleDateString(),
                licenseNumber: doctor.licenceNo || doctor.reg_code,
                renewUrl: `${this.frontendUrl}/dashboard/profile`,
            },
        });
    }

    async sendLicenseExpiredNotification(doctor: any) {
        if ((await this.settingsService.get('EMAIL_LICENSE_EXPIRY_WARNING')) === 'false') return;

        await this.sendMailWithContext({
            to: doctor.email,
            subject: 'Account Deactivated - License Expired',
            template: './license-expired',
            context: {
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                expiryDate: new Date(doctor.licenseExpiryDate).toLocaleDateString(),
                licenseNumber: doctor.licenceNo || doctor.reg_code,
                renewUrl: `${this.frontendUrl}/dashboard/profile`,
                supportEmail: process.env.SMTP_FROM_EMAIL || 'support@mclinic.co.ke',
            },
        });
    }

    async sendAccountReactivatedEmail(doctor: any) {
        await this.sendMailWithContext({
            to: doctor.email,
            subject: 'Account Reactivated - License Renewed',
            template: './account-reactivated',
            context: {
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                newExpiryDate: new Date(doctor.licenseExpiryDate).toLocaleDateString(),
                dashboardUrl: `${this.frontendUrl}/dashboard`,
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
}
