import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private mailerService;
    private configService;
    constructor(mailerService: MailerService, configService: ConfigService);
    private get frontendUrl();
    sendAccountCreationEmail(user: any, role: string): Promise<void>;
    sendLoginAttemptEmail(user: any, ipAddress: string, location: string): Promise<void>;
    sendBookingConfirmationEmail(user: any, appointment: any, doctor: any): Promise<void>;
    sendBookingReminderEmail(user: any, appointment: any, doctor: any): Promise<void>;
    sendInvoiceEmail(user: any, invoice: any, items: any[]): Promise<void>;
    sendPaymentConfirmationEmail(user: any, payment: any, invoice: any): Promise<void>;
    sendDoctorApprovalEmail(doctor: any, status: 'approved' | 'rejected', reason?: string): Promise<void>;
    sendPrescriptionReadyEmail(patient: any, prescription: any, doctor: any): Promise<void>;
    sendOrderShippedEmail(user: any, order: any, trackingNumber: string): Promise<void>;
    sendPasswordResetEmail(user: any, resetToken: string): Promise<void>;
    sendAppointmentCancellationEmail(user: any, appointment: any, reason: string): Promise<void>;
    sendLicenseExpiryWarning(doctor: any, daysRemaining: number): Promise<void>;
    sendLicenseExpiredNotification(doctor: any): Promise<void>;
    sendAccountReactivatedEmail(doctor: any): Promise<void>;
}
