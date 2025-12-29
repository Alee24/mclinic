"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
let EmailService = class EmailService {
    mailerService;
    configService;
    constructor(mailerService, configService) {
        this.mailerService = mailerService;
        this.configService = configService;
    }
    get frontendUrl() {
        return this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }
    async sendAccountCreationEmail(user, role) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Welcome to M-Clinic Health',
                template: './account-creation',
                context: {
                    name: `${user.fname} ${user.lname}`,
                    role: role,
                    loginUrl: `${this.frontendUrl}/login`,
                    dashboardUrl: `${this.frontendUrl}/dashboard`,
                },
            });
            console.log(`Account creation email sent to ${user.email}`);
        }
        catch (error) {
            console.error('Failed to send account creation email:', error);
        }
    }
    async sendLoginAttemptEmail(user, ipAddress, location) {
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
        }
        catch (error) {
            console.error('Failed to send login attempt email:', error);
        }
    }
    async sendBookingConfirmationEmail(user, appointment, doctor) {
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
                    appointmentUrl: `${this.frontendUrl}/dashboard/appointments`,
                },
            });
            console.log(`Booking confirmation email sent to ${user.email}`);
        }
        catch (error) {
            console.error('Failed to send booking confirmation email:', error);
        }
    }
    async sendBookingReminderEmail(user, appointment, doctor) {
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
        }
        catch (error) {
            console.error('Failed to send appointment reminder email:', error);
        }
    }
    async sendInvoiceEmail(user, invoice, items) {
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
        }
        catch (error) {
            console.error('Failed to send invoice email:', error);
        }
    }
    async sendPaymentConfirmationEmail(user, payment, invoice) {
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
        }
        catch (error) {
            console.error('Failed to send payment confirmation email:', error);
        }
    }
    async sendDoctorApprovalEmail(doctor, status, reason) {
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
        }
        catch (error) {
            console.error('Failed to send doctor approval email:', error);
        }
    }
    async sendPrescriptionReadyEmail(patient, prescription, doctor) {
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
        }
        catch (error) {
            console.error('Failed to send prescription ready email:', error);
        }
    }
    async sendOrderShippedEmail(user, order, trackingNumber) {
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
        }
        catch (error) {
            console.error('Failed to send order shipped email:', error);
        }
    }
    async sendPasswordResetEmail(user, resetToken) {
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
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
    }
    async sendAppointmentCancellationEmail(user, appointment, reason) {
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
        }
        catch (error) {
            console.error('Failed to send appointment cancellation email:', error);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map