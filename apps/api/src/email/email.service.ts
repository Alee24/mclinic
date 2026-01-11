import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
    ) { }

    private get frontendUrl(): string {
        return this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }

    async sendAccountCreationEmail(user: any, role: string) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Account creation email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send account creation email:', error);
        }
    }

    async sendLoginAttemptEmail(user: any, ipAddress: string, location: string) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Login attempt email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send login attempt email:', error);
        }
    }

    async sendBookingConfirmationEmail(user: any, appointment: any, doctor: any) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Booking confirmation email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send booking confirmation email:', error);
        }
    }

    async sendAppointmentNotificationToDoctor(doctor: any, appointment: any, patient: any) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Appointment notification email sent to doctor ${doctor.email}`);
        } catch (error) {
            console.error('Failed to send appointment notification to doctor:', error);
        }
    }

    async sendBookingReminderEmail(user: any, appointment: any, doctor: any) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Appointment reminder email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send appointment reminder email:', error);
        }
    }

    async sendInvoiceEmail(user: any, invoice: any, items: any[]) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Invoice email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send invoice email:', error);
        }
    }

    async sendPaymentConfirmationEmail(user: any, payment: any, invoice: any) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Payment confirmation email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send payment confirmation email:', error);
        }
    }

    async sendDoctorApprovalEmail(doctor: any, status: 'approved' | 'rejected', reason?: string) {
        try {
            await this.mailerService.sendMail({
                to: doctor.email,
                subject: status === 'approved' ? 'Account Approved - M-Clinic Health' : 'Account Application Update',
                template: './doctor-approval',
                context: {
                    name: `Dr. ${doctor.fname} ${doctor.lname}`,
                    status: status,
                    reason: reason || '',
                    dashboardUrl: `${this.frontendUrl}/dashboard`,
                    supportEmail: this.configService.get('SMTP_FROM_EMAIL'),
                },
            });
            console.log(`Doctor ${status} email sent to ${doctor.email}`);
        } catch (error) {
            console.error('Failed to send doctor approval email:', error);
        }
    }

    async sendPrescriptionReadyEmail(patient: any, prescription: any, doctor: any) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Prescription ready email sent to ${patient.email}`);
        } catch (error) {
            console.error('Failed to send prescription ready email:', error);
        }
    }

    async sendOrderShippedEmail(user: any, order: any, trackingNumber: string) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Order shipped email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send order shipped email:', error);
        }
    }

    async sendPasswordResetEmail(user: any, resetToken: string) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Password Reset Request - M-Clinic Health',
                template: './password-reset',
                context: {
                    name: `${user.fname} ${user.lname}`,
                    resetUrl: `${this.frontendUrl}/reset-password?token=${resetToken}`,
                    expiryTime: '1 hour',
                },
            });
            console.log(`Password reset email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
        }
    }

    async sendAppointmentCancellationEmail(user: any, appointment: any, reason: string) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`Appointment cancellation email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send appointment cancellation email:', error);
        }
    }

    async sendLicenseExpiryWarning(doctor: any, daysRemaining: number) {
        try {
            await this.mailerService.sendMail({
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
            console.log(`License expiry warning sent to ${doctor.email}`);
        } catch (error) {
            console.error('Failed to send license expiry warning:', error);
        }
    }

    async sendLicenseExpiredNotification(doctor: any) {
        try {
            await this.mailerService.sendMail({
                to: doctor.email,
                subject: 'Account Deactivated - License Expired',
                template: './license-expired',
                context: {
                    name: `Dr. ${doctor.fname} ${doctor.lname}`,
                    expiryDate: new Date(doctor.licenseExpiryDate).toLocaleDateString(),
                    licenseNumber: doctor.licenceNo || doctor.reg_code,
                    renewUrl: `${this.frontendUrl}/dashboard/profile`,
                    supportEmail: this.configService.get('SMTP_FROM_EMAIL'),
                },
            });
            console.log(`License expired notification sent to ${doctor.email}`);
        } catch (error) {
            console.error('Failed to send license expired notification:', error);
        }
    }

    async sendAccountReactivatedEmail(doctor: any) {
        try {
            await this.mailerService.sendMail({
                to: doctor.email,
                subject: 'Account Reactivated - License Renewed',
                template: './account-reactivated',
                context: {
                    name: `Dr. ${doctor.fname} ${doctor.lname}`,
                    newExpiryDate: new Date(doctor.licenseExpiryDate).toLocaleDateString(),
                    dashboardUrl: `${this.frontendUrl}/dashboard`,
                },
            });
            console.log(`Account reactivated email sent to ${doctor.email}`);
        } catch (error) {
            console.error('Failed to send account reactivated email:', error);
        }
    }
    async sendLabResultsReadyEmail(user: any, order: any, testName: string) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Lab Results Ready - M-Clinic Health',
                template: './lab-results-ready',
                context: {
                    name: user.role === 'patient' ? user.fname : (order.beneficiaryName || user.fname), // Use beneficiary name if set, else user fname
                    testName: testName,
                    resultsUrl: `${this.frontendUrl}/dashboard/lab`,
                    reportUrl: order.report_url ? `${process.env.API_URL || 'http://localhost:3434'}/uploads/reports/${order.report_url}` : null,
                    notes: order.technicianNotes,
                    year: new Date().getFullYear(),
                },
            });
            console.log(`Lab results ready email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send lab results email:', error);
        }
    }
}
