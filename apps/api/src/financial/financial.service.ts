import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { PaymentConfig, PaymentProvider } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';
import { WalletsService } from '../wallets/wallets.service';
import { MpesaService } from '../mpesa/mpesa.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class FinancialService {
    constructor(
        @InjectRepository(PaymentConfig)
        private configRepo: Repository<PaymentConfig>,
        @InjectRepository(ServicePrice)
        private priceRepo: Repository<ServicePrice>,
        @InjectRepository(Transaction)
        private txRepo: Repository<Transaction>,
        @InjectRepository(Invoice)
        private invoiceRepo: Repository<Invoice>,
        @InjectRepository(InvoiceItem)
        private invoiceItemRepo: Repository<InvoiceItem>,
        @InjectRepository(Doctor)
        private doctorRepo: Repository<Doctor>,
        @InjectRepository(SystemSetting)
        private settingRepo: Repository<SystemSetting>,
        private walletsService: WalletsService,
        private mpesaService: MpesaService,
        private notificationService: NotificationService,
    ) { }

    // --- Config Management ---
    async setConfig(provider: PaymentProvider, credentials: any): Promise<PaymentConfig> {
        let config = await this.configRepo.findOne({ where: { provider } });
        if (!config) {
            config = this.configRepo.create({ provider });
        }
        config.credentials = JSON.stringify(credentials);
        return this.configRepo.save(config);
    }

    async getConfig(provider: PaymentProvider): Promise<PaymentConfig | null> {
        return this.configRepo.findOne({ where: { provider } });
    }

    // --- Pricing Management ---
    async setPrice(serviceName: string, amount: number, doctorId?: number): Promise<ServicePrice> {
        // Check if override exists
        const where: any = { serviceName };
        if (doctorId) {
            where.doctorId = doctorId;
        } else {
            where.doctorId = IsNull();
        }

        let existingPrice = await this.priceRepo.findOne({ where });

        let priceToSave: ServicePrice;
        if (existingPrice) {
            priceToSave = existingPrice;
        } else {
            priceToSave = this.priceRepo.create({
                serviceName,
                doctorId: doctorId || null,
            } as DeepPartial<ServicePrice>);
        }

        priceToSave.amount = amount;
        return this.priceRepo.save(priceToSave);
    }

    async getPrices(doctorId?: number): Promise<ServicePrice[]> {
        // Return global prices + overrides for specific doctor
        const query = this.priceRepo.createQueryBuilder('price')
            .where('price.doctorId IS NULL');

        if (doctorId) {
            query.orWhere('price.doctorId = :doctorId', { doctorId });
        }

        return query.getMany();
    }

    // --- Transactions ---
    async recordTransaction(data: Partial<Transaction>): Promise<Transaction> {
        const tx = this.txRepo.create(data);
        return this.txRepo.save(tx);
    }

    async getAllTransactions(): Promise<Transaction[]> {
        return this.txRepo.find({ order: { createdAt: 'DESC' }, relations: ['user'] });
    }

    // --- Invoicing ---
    async createInvoice(data: { customerName: string; customerEmail: string; dueDate?: Date; items: any[]; invoiceNumber?: string }): Promise<Invoice> {
        const invoiceNumber = data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

        let totalAmount = 0;
        const items = data.items.map(item => {
            const amount = item.quantity * item.unitPrice;
            totalAmount += amount;
            return {
                ...item,
                amount,
            };
        });

        const invoice = this.invoiceRepo.create({
            invoiceNumber,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            dueDate: data.dueDate,
            totalAmount,
            status: InvoiceStatus.PENDING,
            items,
        });

        const savedInvoice = await this.invoiceRepo.save(invoice);

        // --- SMS Notification (New Invoice Generated) ---
        try {
            const isAmbulance = savedInvoice.invoiceNumber?.startsWith('AMB-');
            const isLab = savedInvoice.invoiceNumber?.startsWith('LB-');
            const isPharmacy = savedInvoice.invoiceNumber?.startsWith('PH-');
            const category = isAmbulance ? 'Ambulance' : (isLab ? 'Lab Order' : (isPharmacy ? 'Pharmacy Prescription' : 'Medical Consultation'));

            const smsMessage = `[New Invoice] Invoice #${savedInvoice.invoiceNumber} for KES ${savedInvoice.totalAmount} has been generated for ${savedInvoice.customerName} (${category}). View and pay: https://portal.mclinic.co.ke/dashboard`;
            // If email field contains phone number (as standard mapped patient identifier) or general mapping, try to notify
            await this.notificationService.sendCustomSms(savedInvoice.customerEmail || '254724454757', smsMessage);
        } catch (error) {
            console.error('[Financial] Failed to send new invoice SMS notification', error);
        }

        return savedInvoice;
    }

    async getInvoices(user: { email: string; role: string; id: number }): Promise<Invoice[]> {
        const query = this.invoiceRepo.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .leftJoinAndSelect('invoice.appointment', 'appointment')
            .orderBy('invoice.createdAt', 'DESC');

        if (user.role === 'patient') {
            // Match email OR appointment patientId
            // We need to fetch patient first to get IDs or just simple ID check if user.id is trustworthy
            // Assuming user.id corresponds to user_id in patient, lets verify logic or stick to email + app match
            // Ideally: invoice.customerEmail = user.email OR appointment.patientId = user.id
            // But patientId in appointment refers to User ID usually.
            query.where('invoice.customerEmail = :email', { email: user.email })
                .orWhere('appointment.patientId = :userId', { userId: user.id }); // Assuming user.id in JWT is valid
        } else if (['doctor', 'medic', 'nurse', 'clinician'].includes(user.role?.toLowerCase())) {
            const doctor = await this.doctorRepo.findOne({ where: { email: user.email } });
            if (doctor) {
                query.where('invoice.doctorId = :doctorId', { doctorId: doctor.id });
            } else {
                return [];
            }
        }

        return query.getMany();
    }

    async getInvoiceById(id: number): Promise<Invoice> {
        const invoice = await this.invoiceRepo.findOne({ where: { id }, relations: ['items'] });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async updateInvoice(id: number, data: any): Promise<Invoice> {
        const invoice = await this.getInvoiceById(id);

        if (data.items) {
            // Delete old items
            await this.invoiceItemRepo.delete({ invoice: { id: id } });

            let totalAmount = 0;
            invoice.items = data.items.map((item: any) => {
                const amount = item.quantity * item.unitPrice;
                totalAmount += amount;
                return this.invoiceItemRepo.create({
                    ...item,
                    amount,
                });
            });
            invoice.totalAmount = totalAmount;
        }

        if (data.customerName) invoice.customerName = data.customerName;
        if (data.customerEmail) invoice.customerEmail = data.customerEmail;
        if (data.dueDate) invoice.dueDate = data.dueDate;
        if (data.status) invoice.status = data.status;

        return this.invoiceRepo.save(invoice);
    }

    async deleteInvoice(id: number): Promise<void> {
        const invoice = await this.getInvoiceById(id);
        await this.invoiceRepo.remove(invoice);
    }

    async getStats(user?: { role: string; email: string; id: number }) {
        console.log(`[FINANCIAL] getStats service called with role: '${user?.role}'`);
        if (user && ['doctor', 'medic', 'nurse', 'clinician'].includes(user.role?.toLowerCase())) {
            return this.getDoctorStats(user);
        }

        // Admin/Global Stats
        const paidInvoices = await this.invoiceRepo.find({
            where: { status: InvoiceStatus.PAID },
            order: { createdAt: 'DESC' } // Newest first
        });

        // 1. Calculate Totals
        let totalRevenue = 0;
        let pharmacyRevenue = 0;
        let labRevenue = 0;
        let serviceRevenue = 0; // Appointments, etc.

        // 2. Daily Trends (Last 7 Days)
        const dailyRevenueMap = new Map<string, number>();
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            dailyRevenueMap.set(d.toISOString().slice(0, 10), 0);
        }

        paidInvoices.forEach(inv => {
            const amount = Number(inv.totalAmount);
            totalRevenue += amount;

            // Breakdown Logic
            // PH-*: Pharmacy
            // LB-*: Lab
            // INV-*: Appointment/Service (Standard)
            // AMB-*: Ambulance
            const prefix = inv.invoiceNumber ? inv.invoiceNumber.split('-')[0] : 'INV';

            if (prefix === 'PH') {
                pharmacyRevenue += amount;
            } else if (prefix === 'LB') {
                labRevenue += amount;
            } else {
                serviceRevenue += amount;
            }

            // Daily Trend
            const dateKey = inv.createdAt.toISOString().slice(0, 10);
            if (dailyRevenueMap.has(dateKey)) {
                dailyRevenueMap.set(dateKey, (dailyRevenueMap.get(dateKey) || 0) + amount);
            }
        });

        const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
            fullDate: date,
            amount
        }));

        // Pending & Overdue
        const pendingCount = await this.invoiceRepo.count({ where: { status: InvoiceStatus.PENDING } });
        const overdueCount = await this.invoiceRepo.count({ where: { status: InvoiceStatus.OVERDUE } });

        // Payment Method Stats (Existing logic reused/simplified)
        const sourceStats = await this.txRepo
            .createQueryBuilder('tx')
            .select('tx.source', 'source')
            .addSelect('SUM(tx.amount)', 'total')
            .groupBy('tx.source')
            .getRawMany();

        const paymentStats = {
            mpesa: 0,
            visa: 0,
            paypal: 0,
            cash: 0,
            others: 0
        };

        sourceStats.forEach(s => {
            const source = (s.source || '').toUpperCase();
            const total = parseFloat(s.total || '0');
            if (source.includes('MPESA')) paymentStats.mpesa += total;
            else if (source.includes('VISA') || source.includes('CARD')) paymentStats.visa += total;
            else if (source.includes('PAYPAL')) paymentStats.paypal += total;
            else if (source.includes('CASH')) paymentStats.cash += total;
            else paymentStats.others += total;
        });

        const netRevenue = totalRevenue * 0.40;

        return {
            totalRevenue,
            netRevenue,
            revenueByDepartment: {
                pharmacy: pharmacyRevenue,
                lab: labRevenue,
                appointments: serviceRevenue,
                total: totalRevenue
            },
            dailyRevenue,
            totalTransactions: await this.txRepo.count(),
            recentTransactions: await this.txRepo.find({
                order: { createdAt: 'DESC' },
                take: 5,
                relations: ['user', 'invoice']
            }),
            invoices: {
                pending: pendingCount,
                paid: paidInvoices.length,
                overdue: overdueCount,
                total: pendingCount + paidInvoices.length + overdueCount
            },
            paymentStats
        };
    }

    async getDoctorStats(user: { email: string; id: number; sub?: number }) {
        const email = user.email.trim();
        const userId = user.sub || user.id;

        // Priority 1: Find by User ID
        let doctor = await this.doctorRepo.findOne({ where: { user_id: userId } });

        // Priority 2: Fallback to Email
        if (!doctor) {
            doctor = await this.doctorRepo.findOne({ where: { email } });
        }

        if (!doctor) {
            console.warn(`[FINANCIAL] getDoctorStats: No doctor profile for ${email}. Returning empty stats.`);
            return {
                balance: 0,
                pendingClearance: 0,
                transactions: []
            };
        }

        console.log(`[FINANCIAL] getDoctorStats: Found provider ${doctor.email} (ID: ${doctor.id}, Role: ${doctor.dr_type}) for User ID: ${userId}`);

        // 1. Wallet Balance (Source of Truth: Wallet Entity)
        let balance = 0;
        try {
            console.log(`[FINANCIAL] getDoctorStats: Checking wallet for ${doctor.email}`);
            const wallet = await this.walletsService.getBalanceByEmail(doctor.email);
            balance = Number(wallet.balance);
            if (isNaN(balance)) balance = 0;

            console.log(`[FINANCIAL] getDoctorStats: Wallet balance for ${doctor.email} is ${balance}`);

            // FIX for Manual DB Updates: 
            // If wallet is 0 but doctor table has manually added balance, assume legacy/manual override and sync.
            const docLegacyBalance = Number(doctor.balance);
            if (balance === 0 && docLegacyBalance > 0) {
                console.log(`[FINANCIAL] getDoctorStats: Detected Manual Balance in Doctor Table (KES ${docLegacyBalance}) vs Wallet (0). Syncing...`);
                balance = docLegacyBalance;

                // Auto-sync wallet to match manual entry
                await this.walletsService.setBalanceByEmail(doctor.email, docLegacyBalance);
                console.log(`[FINANCIAL] getDoctorStats: Wallet synced for ${doctor.email}`);
            }

        } catch (e) {
            console.warn(`[FINANCIAL] getDoctorStats: No wallet found for ${doctor.email}, using legacy balance from doctors table.`);
            balance = Number(doctor.balance);
            if (isNaN(balance)) balance = 0;
            console.log(`[FINANCIAL] getDoctorStats: Legacy balance for ${doctor.email} is ${balance}`);
        }

        // 2. Pending Clearance
        // Funds held in PENDING transactions linked to this doctor's invoices
        const pendingTransactions = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .where('inv.doctorId = :doctorId', { doctorId: doctor.id })
            .andWhere('tx.status = :status', { status: TransactionStatus.PENDING })
            .getMany();

        let pendingClearance = 0;
        pendingTransactions.forEach(tx => {
            if (tx.invoice) {
                const total = Number(tx.invoice.totalAmount);
                const commission = Number(tx.invoice.commissionAmount || 0);
                pendingClearance += (total - commission);
            }
        });

        // 3. Recent Transactions (Withdrawals OR Earnings)
        // Withdrawals: tx.userId = user.id (Using ID for robustness)
        // Earnings: tx.invoice.doctorId = doctor.id
        const transactions = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .leftJoinAndSelect('tx.user', 'user')
            .leftJoinAndSelect('inv.appointment', 'appt')
            .leftJoinAndSelect('appt.patient', 'patient')
            .where('tx.userId = :userId', { userId: user.id }) // Withdrawals via User ID
            .orWhere('(inv.doctorId = :doctorId AND (inv.invoiceNumber LIKE \'INV-%\' OR inv.appointmentId IS NOT NULL))', { doctorId: doctor.id }) // Strict Earnings Check
            .orderBy('tx.createdAt', 'DESC')
            .take(10)
            .getMany();

        return {
            balance,
            pendingClearance,
            transactions
        };
    }

    // M-Pesa STK Push Integration
    async initiateMpesaPayment(phoneNumber: string, amount: number, invoiceId: number) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        console.log(`[FINANCIAL] Initiating M-Pesa STK Push for Invoice #${invoice.invoiceNumber} to ${phoneNumber}`);

        const transaction = await this.mpesaService.initiateSTKPush(
            phoneNumber,
            amount,
            invoice.invoiceNumber,
            `Payment for Invoice #${invoice.invoiceNumber}`,
            'invoice',
            invoice.id
        );

        return {
            success: true,
            message: 'STK Push initiated. Please check your phone.',
            checkoutRequestId: transaction.checkoutRequestId,
            transactionId: transaction.id
        };
    }

    // M-Pesa Callback Handler (Legacy / Fallback)
    async handleMpesaCallback(callbackData: any) {
        try {
            console.log('[FINANCIAL] handleMpesaCallback received data');
            const callback = callbackData?.Body?.stkCallback;
            if (!callback) return { success: false };

            const resultCode = callback.ResultCode;

            if (resultCode === 0) {
                // Payment successful
                const metadata = callback.CallbackMetadata?.Item || [];
                const receiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
                const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;

                console.log(`[FINANCIAL] M-Pesa Callback Success: Amount=${amount}, Receipt=${receiptNumber}`);

                // Find pending invoice with matching amount
                // ideally check checkoutRequestID if we had it, but searching by amount matches legacy behavior
                const invoice = await this.invoiceRepo.findOne({
                    where: {
                        totalAmount: amount,
                        status: InvoiceStatus.PENDING
                    }
                });

                if (invoice) {
                    console.log(`[FINANCIAL] Matched Invoice #${invoice.invoiceNumber} (ID: ${invoice.id}). Confirming payment...`);
                    // Reuse the ROBUST confirm method!
                    return await this.confirmInvoicePayment(invoice.id, 'MPESA', receiptNumber);
                } else {
                    console.warn(`[FINANCIAL] No matching PENDING invoice found for amount ${amount}`);
                }
            } else {
                console.log(`[MPESA] Payment failed: ${callback.ResultDesc}`);
                // Notify Admin of Failure
                await this.notificationService.notifyAdmin(
                    'payment_failure',
                    `Payment Failed: ${callback.ResultDesc} (Mpesa)`
                );
            }

            return { success: true };
        } catch (e) {
            console.error('[FINANCIAL] handleMpesaCallback error:', e);
            return { success: false };
        }
    }

    // Process Payment (Direct from Frontend)
    async processPayment(appointmentId: number, amount: number, phoneNumber: string) {
        // ... (Invoice finding logic) ...
        let invoice = await this.invoiceRepo.createQueryBuilder('inv')
            .where('inv.invoiceNumber LIKE :suffix', { suffix: `%-${appointmentId}` })
            .getOne();
        if (!invoice) throw new NotFoundException('Invoice not found for this appointment');

        invoice.status = InvoiceStatus.PAID;
        await this.invoiceRepo.save(invoice);

        // Credit Doctor Balance Immediately
        if (invoice.doctorId) {
            // Strict Check: ONLY credit for Bookings/Appointments
            const isAppointmentInvoice = invoice.invoiceNumber?.startsWith('INV-') || invoice.appointmentId;

            if (isAppointmentInvoice) {
                // Logic: 60% to Doctor (Standard)
                // Note: For processPayment (direct), we might want to do the same robust check as above, 
                // but usually direct payment is only for appointments via that endpoint.
                const doctorShare = amount * 0.60;
                const commission = amount * 0.40;

                invoice.commissionAmount = commission;
                await this.invoiceRepo.save(invoice);

                // DEPRECATED: await this.doctorRepo.increment({ id: invoice.doctorId }, 'balance', doctorShare);
                // Funds are now held in PENDING state until appointment is completed.
                // We will NOT credit the wallet here. It will be credited in releaseFunds.
                // await this.walletsService.creditByEmail(doctor.email, doctorShare, `Payment for Appointment #${appointmentId}`);
            }
        }

        // Record Transaction as COMPLETED (Funds Available)
        const transaction = this.txRepo.create({
            amount: amount,
            source: 'MPESA',
            reference: `MPE${Date.now()}`,
            status: TransactionStatus.PENDING, // Funds Held in Escrow until Completed
            invoice: invoice,
            invoiceId: invoice.id
        });
        await this.txRepo.save(transaction);

        // Update Appointment Status to CONFIRMED
        await this.doctorRepo.manager.update('appointment', { id: appointmentId }, { status: 'confirmed' });

        // Send Notifications
        await this.sendConfirmationSms(appointmentId);

        return { success: true, message: 'Payment processed successfully' };
    }

    // Manual Payment Confirmation
    async confirmInvoicePayment(invoiceId: number, paymentMethod: string, transactionId?: string) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (invoice.status === InvoiceStatus.PAID) {
            return { success: true, message: 'Invoice already paid', invoice };
        }

        invoice.status = InvoiceStatus.PAID;
        await this.invoiceRepo.save(invoice);

        // Credit Doctor Balance Immediately
        if (invoice.doctorId) {
            const isAppointmentInvoice = invoice.invoiceNumber?.startsWith('INV-') || invoice.appointmentId;
            if (isAppointmentInvoice) {
                const total = Number(invoice.totalAmount);
                const doctorShare = total * 0.60;
                const commission = total * 0.40;

                invoice.commissionAmount = commission;
                await this.invoiceRepo.save(invoice);

                // Funds are now held in PENDING state until appointment is completed.
                // We will NOT credit the wallet here. It will be credited in releaseFunds.
                // await this.walletsService.creditByEmail(doctor.email, doctorShare, `Payment for Invoice #${invoiceId}`);
            }
        }

        // --- Appointment Logic (Update Status & SMS) ---
        let appId: number | null = invoice.appointmentId;
        if (!appId && invoice.invoiceNumber && invoice.invoiceNumber.startsWith('INV-')) {
            const parts = invoice.invoiceNumber.split('-');
            appId = parts.length > 2 ? parseInt(parts[2]) : null;
        }

        if (appId) {
            try {
                console.log(`[FINANCIAL] Confirming Appointment #${appId} for Paid Invoice #${invoiceId}`);
                await this.doctorRepo.manager.update('appointment', { id: appId }, { status: 'confirmed' });
                await this.sendConfirmationSms(appId);
            } catch (err) {
                console.error(`[FINANCIAL] Failed to update appointment status for #${appId}:`, err);
            }
        }

        // Create transaction record
        const transaction = this.txRepo.create({
            amount: invoice.totalAmount,
            source: paymentMethod.toUpperCase(),
            reference: transactionId || `MAN${Date.now()}`,
            status: TransactionStatus.PENDING, // Funds Held in Escrow until Completed
            invoice: invoice,
            invoiceId: invoice.id
        });
        await this.txRepo.save(transaction);

        // Check for Ambulance Subscription
        if (invoice.invoiceNumber && invoice.invoiceNumber.startsWith('AMB-SUB-')) {
            const parts = invoice.invoiceNumber.split('-');
            const subId = parts[2];
            if (subId) {
                await this.invoiceRepo.query('UPDATE ambulance_subscriptions SET status = ? WHERE id = ?', ['active', subId]);
            }
        }

        // --- SMS Notification for Non-Appointment Paid Invoices (Pharmacy, Lab, Ambulance) ---
        if (!appId) {
            try {
                const prefix = invoice.invoiceNumber ? invoice.invoiceNumber.split('-')[0] : 'INV';
                const isAmb = invoice.invoiceNumber?.startsWith('AMB-');
                const isLab = invoice.invoiceNumber?.startsWith('LB-');
                const isPharmacy = invoice.invoiceNumber?.startsWith('PH-');
                const category = isAmb ? 'Ambulance Coverage' : (isLab ? 'Lab Order / Results' : (isPharmacy ? 'Pharmacy Prescription' : 'Medical Service'));

                const smsMessage = `[Payment Confirmed] Payment of KES ${invoice.totalAmount} for Invoice #${invoice.invoiceNumber} (${category}) has been verified. Status: ACTIVE/PAID. Customer: ${invoice.customerName}. Thank you for choosing M-Clinic.`;
                await this.notificationService.sendCustomSms(invoice.customerEmail || '254724454757', smsMessage);

                // Notify admin too
                await this.notificationService.notifyAdmin('booking', `Payment Verified: KES ${invoice.totalAmount} for Invoice #${invoice.invoiceNumber} (${category}).`);
            } catch (error) {
                console.error('[Financial] Failed to send general payment SMS notification', error);
            }
        }

        return { success: true, message: 'Payment confirmed successfully', invoice };
    }

    private async sendConfirmationSms(appointmentId: number) {
        try {
            const appt = await this.invoiceRepo.manager.getRepository(Appointment).findOne({
                where: { id: appointmentId },
                relations: ['patient', 'doctor']
            });

            if (appt && appt.patient) {
                const patient = appt.patient;
                const doctor = appt.doctor;
                const portalUrl = 'https://portal.mclinic.co.ke';
                const apptTime = `${new Date(appt.appointment_date).toDateString()} @ ${appt.appointment_time}`;

                if (doctor) {
                    // 1. SMS to Patient: Confirmation + Doctor Contact
                    const patientMsg = `Appointment Confirmed! You have an appointment with Dr. ${doctor.fname} ${doctor.lname} on ${apptTime}. Medic Contact: ${doctor.mobile || 'N/A'}. View details: ${portalUrl}/dashboard/appointments`;
                    await this.notificationService.sendCustomSms(patient.mobile, patientMsg);

                    // 2. SMS to Doctor: Confirmation + Patient Contact
                    const doctorMsg = `Confirmed Appointment: ${patient.fname} ${patient.lname} has paid for their appointment on ${apptTime}. Patient Contact: ${patient.mobile || 'N/A'}. View details: ${portalUrl}/dashboard/appointments`;
                    await this.notificationService.sendCustomSms(doctor.mobile, doctorMsg);
                } else if (appt.isConcierge) {
                    // Concierge Confirmation
                    const patientMsg = `Medical Concierge Confirmed! Your booking for ${apptTime} has been paid. A personal healthcare coordinator will be assigned to you shortly. View: ${portalUrl}/dashboard/appointments`;
                    await this.notificationService.sendCustomSms(patient.mobile, patientMsg);
                }

                // 3. Notify Admin
                await this.notificationService.notifyAdmin(
                    'booking',
                    `Payment Confirmed for Appt #${appointmentId}: ${patient.fname} ${appt.isConcierge ? '(Concierge)' : `vs Dr. ${doctor?.lname}`}. Notification sent.`
                );
            }
        } catch (error) {
            console.error('[Financial] Failed to send post-payment SMS notifications', error);
        }
    }

    // Release Funds (Called when Appointment is COMPLETED)
    async releaseFunds(appointmentId: number) {
        console.log(`[FINANCIAL] releaseFunds called for Appointment #${appointmentId} - Releasing funds from Escrow`);

        // Find the pending transaction linked to this appointment
        const transaction = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .where('inv.appointmentId = :appId OR inv.invoiceNumber LIKE :suffix', { appId: appointmentId, suffix: `%-${appointmentId}` })
            .andWhere('tx.status = :status', { status: TransactionStatus.PENDING })
            .getOne();

        if (transaction) {
            // Release the pending transaction
            transaction.status = TransactionStatus.COMPLETED;
            await this.txRepo.save(transaction);

            if (transaction.invoice && transaction.invoice.doctorId) {
                // Determine Doctor Share
                const total = Number(transaction.invoice.totalAmount);
                const commission = Number(transaction.invoice.commissionAmount || (total * 0.40));
                const doctorShare = total - commission;
                
                const doctor = await this.doctorRepo.findOne({ where: { id: transaction.invoice.doctorId } });
                if (doctor && doctor.email) {
                    await this.walletsService.creditByEmail(doctor.email, doctorShare, `Funds released for Appointment #${appointmentId}`);
                    console.log(`[FINANCIAL] Funds released to ${doctor.email}: KES ${doctorShare}`);
                }
            }
        }
    }

    async withdrawFunds(user: { email: string; id: number }, amount: number, method: string, details: string) {
        if (!method || !details) throw new BadRequestException('Withdrawal method and details required');

        const doctor = await this.doctorRepo.findOne({ where: { email: user.email } });
        if (!doctor) {
            throw new NotFoundException('Doctor account not found');
        }

        // Legacy balance check removed in favor of Wallet check below

        const wallet = await this.walletsService.getBalanceByEmail(user.email);
        const balance = Number(wallet.balance);
        if (balance < amount) {
            throw new BadRequestException('Insufficient funds');
        }

        // Deduct from wallet
        await this.walletsService.debitByEmail(user.email, amount, `Withdrawal: ${method} - ${details}`);

        // Update Doctor balance for backward compatibility (optional but confusing if we keep two sources)
        // Let's just update it so they stay somewhat in sync? 
        // Or better, assume Wallet is now source of truth.
        doctor.balance = balance - amount; // Updating legacy column just in case old UI reads it
        await this.doctorRepo.save(doctor);

        // Record Transaction
        const transaction = this.txRepo.create({
            amount: amount,
            source: 'WITHDRAWAL',
            reference: `${method}-${details}`, // Store method and address/phone
            status: TransactionStatus.COMPLETED, // Mark as complete (simulated instant withdrawal)
            user: { id: user.id } as any, // Link explicitly by ID
            userId: user.id, // Explicitly set FK column if needed, though TypeORM relation should handle it
            type: 'debit',
            createdAt: new Date()
        });

        await this.txRepo.save(transaction);

        return {
            success: true,
            newBalance: doctor.balance,
            transaction
        };
    }

    async debugListDoctors() {
        return this.doctorRepo.find({ select: ['id', 'email', 'fname', 'balance'] });
    }

    async recalculateDoctorBalance(doctorId: number) {
        const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
        if (!doctor) throw new NotFoundException('Doctor not found');

        console.log(`[FINANCIAL] Reconciling Balance for Doctor: ${doctor.email} (ID: ${doctor.id})`);

        // 1. Sum up all PAID invoices linked to this doctor
        // We calculate the doctor's share: Total - Commission
        const invoices = await this.invoiceRepo.find({
            where: {
                doctorId: doctorId,
                status: InvoiceStatus.PAID
            }
        });

        let totalEarnings = 0;
        invoices.forEach(inv => {
            const total = Number(inv.totalAmount);
            const commission = Number(inv.commissionAmount || (total * 0.40)); // Fallback to 40% if not set
            const doctorShare = total - commission;
            totalEarnings += doctorShare;
        });

        console.log(`[FINANCIAL] Total Earnings (Paid Invoices): ${totalEarnings}`);

        // 2. Sum up all COMPLETED Withdrawals (Debits)
        // We look for transactions where type='debit' AND (userId matches doctor's user OR user.email matches doctor.email)
        // Since we don't have a direct link from Doctor to User in this service easily without query, 
        // we'll use email matching as the most robust bridge for legacy + new.

        const withdrawals = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.user', 'user')
            .where('tx.type = :type', { type: 'debit' })
            .andWhere('tx.status = :status', { status: TransactionStatus.COMPLETED })
            .andWhere(
                '(user.email = :email OR tx.userId = (SELECT id FROM user WHERE email = :email))',
                { email: doctor.email }
            )
            .getMany();

        let totalWithdrawals = 0;
        withdrawals.forEach(tx => {
            totalWithdrawals += Number(tx.amount);
        });

        console.log(`[FINANCIAL] Total Withdrawals: ${totalWithdrawals}`);

        // 3. Calculate New Balance
        const newBalance = totalEarnings - totalWithdrawals;
        console.log(`[FINANCIAL] New Balance: ${newBalance} (Old: ${doctor.balance})`);

        // 4. Update Doctor
        doctor.balance = newBalance;
        await this.doctorRepo.save(doctor);

        return {
            success: true,
            oldBalance: doctor.balance,
            newBalance,
            totalEarnings,
            totalWithdrawals,
            invoicesCount: invoices.length,
            withdrawalsCount: withdrawals.length
        };
    }

    async migrateBalancesToWallets() {
        const doctors = await this.doctorRepo.find();
        let migratedCount = 0;
        const results = [];

        for (const doctor of doctors) {
            if (Number(doctor.balance) > 0 && doctor.email) {
                try {
                    await this.walletsService.setBalanceByEmail(doctor.email, Number(doctor.balance));
                    results.push({ email: doctor.email, balance: doctor.balance, status: 'Migrated' });
                    migratedCount++;
                } catch (e) {
                    results.push({ email: doctor.email, error: e.message, status: 'Failed' });
                }
            } else {
                // Ensure wallet exists even if 0 balance
                if (doctor.email) {
                    try {
                        await this.walletsService.getBalanceByEmail(doctor.email);
                    } catch (e) { }
                }
            }
        }
        return { success: true, migratedCount, details: results };
    }
    // --- Revenue Reporting ---
    async getRevenueReport() {
        // Fetch ALL invoices (Pending, Paid, Overdue)
        const invoices = await this.invoiceRepo.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .leftJoinAndSelect('invoice.appointment', 'appt')
            // Join Patient User (Standard User)
            .leftJoinAndSelect('appt.patient', 'patientUser')
            // Join Doctor
            .leftJoinAndSelect('appt.doctor', 'doctor')
            // Join Patient Profile (for Insurance) manually
            .leftJoinAndMapOne('appt.patientDetails', Patient, 'patientDetails', 'patientDetails.user_id = appt.patientId')
            .orderBy('invoice.createdAt', 'DESC')
            .getMany();

        return invoices.map(inv => {
            const appt = inv.appointment;
            // Get patient from Appointment OR look for manual fallback (if we added it, but for now appt is main link)
            // Note: Pharmacy orders might not link to appointment directly but link to Customer Email/Name
            // If it's a pharmacy order (PH-), we might need to fetch user separately if not linked to appointment.

            const patientUser = appt?.patient;
            // @ts-ignore
            const patientDetails = appt?.patientDetails as Patient;

            let serviceName = 'General Service';
            if (inv.items?.length > 0) {
                serviceName = inv.items.map(i => i.description).join(', ');
            }

            // Detect Type
            let type = 'Service';
            if (inv.invoiceNumber?.startsWith('PH-')) type = 'Pharmacy';
            else if (inv.invoiceNumber?.startsWith('LB-')) type = 'Laboratory';
            else if (inv.invoiceNumber?.startsWith('AMB-')) type = 'Ambulance';

            return {
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                date: inv.createdAt,
                amount: Number(inv.totalAmount),
                status: inv.status, // PENDING, PAID, OVERDUE
                type: type,
                serviceDetails: serviceName,
                doctor: appt?.doctor ? `${appt.doctor.fname} ${appt.doctor.lname}` : 'N/A',
                patient: patientUser ? `${patientUser.fname} ${patientUser.lname}` : (inv.customerName || 'Guest'),
                insurance: patientDetails?.insurance_provider ? `${patientDetails.insurance_provider} - ${patientDetails.insurance_policy_no}` : 'None',
                paymentMethod: inv.paymentMethod || 'N/A',
                commission: Number(inv.commissionAmount || 0)
            };
        });
    }

    private async getCompanySettings() {
        const companySettingsArr = await this.settingRepo.find();
        const settingsMap: Record<string, string> = {};
        for (const s of companySettingsArr) {
            settingsMap[s.key] = s.value;
        }

        // Build active uploader logo endpoint if uploaded path is present
        let logoUrl = settingsMap['COMPANY_LOGO_URL'] || 'https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png';
        if (logoUrl && !logoUrl.startsWith('http')) {
            logoUrl = `https://portal.mclinic.co.ke/api/settings/logo-image/${logoUrl}`;
        }

        return {
            clinicName: settingsMap['COMPANY_NAME'] || 'M-Clinic Services Kenya',
            clinicAddress: settingsMap['COMPANY_ADDRESS'] || 'Nairobi, Kenya',
            clinicEmail: settingsMap['COMPANY_EMAIL'] || 'support@mclinic.co.ke',
            clinicPhone: settingsMap['COMPANY_PHONE'] || '+254 724 454 757',
            clinicLogo: logoUrl,
            clinicTagline: settingsMap['COMPANY_TAGLINE'] || 'Official Digital Healthcare Portal',
            bankName: settingsMap['COMPANY_BANK_NAME'] || 'Equity Bank',
            bankAccName: settingsMap['COMPANY_BANK_ACC_NAME'] || 'M-Clinic Services Limited',
            bankAccNo: settingsMap['COMPANY_BANK_ACC_NO'] || '1234567890123',
            mpesaTillPaybill: settingsMap['COMPANY_MPESA_TILL_PAYBILL'] || '300977',
            facebook: settingsMap['COMPANY_FB'] || 'https://facebook.com/mclinic',
            twitter: settingsMap['COMPANY_TWITTER'] || 'https://twitter.com/mclinic',
            instagram: settingsMap['COMPANY_IG'] || 'https://instagram.com/mclinic',
            linkedin: settingsMap['COMPANY_LINKEDIN'] || 'https://linkedin.com/company/mclinic'
        };
    }

    async generateReceipt(transactionId: number) {
        const tx = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .leftJoinAndSelect('invoice.appointment', 'appt')
            .leftJoinAndSelect('appt.patient', 'patientUser')
            .leftJoinAndSelect('appt.doctor', 'doctor')
            .leftJoinAndMapOne('appt.patientDetails', Patient, 'patientDetails', 'patientDetails.user_id = appt.patientId')
            .where('tx.id = :id', { id: transactionId })
            .getOne();

        if (!tx) throw new NotFoundException('Transaction not found');

        const invoice = tx.invoice;
        const appt = invoice?.appointment;
        // @ts-ignore
        const patientDetails = appt?.patientDetails as Patient;
        const patientName = appt?.patient ? `${appt.patient.fname} ${appt.patient.lname}` : (invoice?.customerName || 'Guest');

        const company = await this.getCompanySettings();

        const currentStatus = tx.status || 'COMPLETED';
        const isInvoice = currentStatus.toLowerCase() !== 'completed' && currentStatus.toLowerCase() !== 'paid';
        const docTitle = isInvoice ? 'Official Invoice' : 'Official Receipt';
        const serialLabel = isInvoice ? 'Invoice No.' : 'Receipt Serial No.';
        const statusLabel = isInvoice ? 'PENDING' : 'COMPLETED';
        const statusColor = isInvoice ? '#f59e0b' : '#16a34a';
        const amountLabel = isInvoice ? 'Amount Due' : 'Amount Paid';

        const receiptData = {
            clinicName: company.clinicName,
            clinicAddress: company.clinicAddress,
            receiptNumber: tx.reference || `REC-${tx.id}`,
            date: tx.createdAt,
            patientName: patientName,
            insurance: patientDetails?.insurance_provider || 'N/A',
            doctor: appt?.doctor ? `${appt.doctor.fname} ${appt.doctor.lname}` : null,
            items: invoice?.items || [],
            totalAmount: tx.amount,
            paymentMethod: tx.source,
            status: currentStatus
        };

        const rows = receiptData.items.map(item => `
            <tr>
                <td style="padding: 16px 12px; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${item.description}</td>
                <td style="padding: 16px 12px; text-align: center; color: #475569; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
                <td style="padding: 16px 12px; text-align: right; color: #475569; font-size: 14px; border-bottom: 1px solid #f1f5f9;">KES ${Number(item.unitPrice).toLocaleString()}</td>
                <td style="padding: 16px 12px; text-align: right; font-weight: 700; color: #0b6e40; font-size: 14px; border-bottom: 1px solid #f1f5f9;">KES ${Number(item.amount).toLocaleString()}</td>
            </tr>
        `).join('');

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${company.clinicName} ${docTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    color: #1e293b;
                    margin: 0;
                    padding: 40px 20px;
                    background-color: #f8fafc;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .receipt-container {
                    max-width: 850px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    position: relative;
                }
                .receipt-header {
                    background: linear-gradient(135deg, #061F14 0%, #0B6E40 100%);
                    padding: 40px;
                    color: #ffffff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .receipt-body {
                    padding: 40px;
                }
                .meta-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                .details-card {
                    background-color: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 24px;
                }
                .verification-card {
                    background-color: #f0fdf4;
                    border: 1px dashed #bbf7d0;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }
                .receipt-table th {
                    background-color: #f8fafc;
                    padding: 16px 12px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #475569;
                    border-bottom: 2px solid #e2e8f0;
                }
                .receipt-table td {
                    padding: 16px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }
                .info-blocks-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .info-block {
                    background-color: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 20px;
                }
                .summary-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                    margin-left: auto;
                    width: 320px;
                }
                .footer-note {
                    text-align: center;
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px dashed #cbd5e1;
                    color: #64748b;
                    font-size: 12px;
                }
                .action-bar {
                    text-align: center;
                    margin-top: 30px;
                }
                .print-btn {
                    background-color: #0B6E40;
                    color: #ffffff;
                    border: none;
                    padding: 14px 28px;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(11, 110, 64, 0.2);
                    transition: all 0.2s ease;
                }
                .print-btn:hover {
                    background-color: #08522e;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(11, 110, 64, 0.3);
                }
                @media print {
                    body {
                        background-color: #ffffff;
                        padding: 0;
                    }
                    .receipt-container {
                        box-shadow: none;
                        border: none;
                        max-width: 100%;
                    }
                    .action-bar {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <!-- Header -->
                <div class="receipt-header">
                    <div>
                        <img src="${company.clinicLogo}" style="height: 55px; margin-bottom: 12px; border-radius: 8px;" alt="${company.clinicName} Logo">
                        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a7f3d0; opacity: 0.9;">${company.clinicTagline}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #a7f3d0; letter-spacing: 0.05em; margin-bottom: 4px;">${serialLabel}</div>
                        <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 4px;">${receiptData.receiptNumber}</div>
                        <div style="font-size: 13px; font-weight: 500; color: #e2e8f0;">${new Date(receiptData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>

                <div class="receipt-body">
                    <!-- Info & Verification Meta Grid -->
                    <div class="meta-grid">
                        <!-- Patient / Medic Info -->
                        <div class="details-card">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Patient Details</div>
                                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${receiptData.patientName}</div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Insurance: ${receiptData.insurance}</div>
                                </div>
                                <div>
                                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Practitioner / Service</div>
                                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${receiptData.doctor || 'M-Clinic Specialist'}</div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${company.clinicName}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Live Dynamic Verification QR Code -->
                        <div class="verification-card">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://portal.mclinic.co.ke/verify?code=' + receiptData.receiptNumber)}" style="width: 100px; height: 100px; border-radius: 8px; border: 4px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" alt="Verification QR">
                            <div style="font-size: 11px; font-weight: 700; color: #0B6E40; margin-top: 10px; display: flex; align-items: center; gap: 4px; justify-content: center;">
                                <svg style="width: 12px; height: 12px; fill: currentColor;" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                SECURE VERIFIED
                            </div>
                            <div style="font-size: 9px; color: #334155; margin-top: 4px;">Scan QR code to verify details</div>
                        </div>
                    </div>

                    <!-- Items table -->
                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th style="width: 55%;">Item Description</th>
                                <th style="width: 10%; text-align: center;">Qty</th>
                                <th style="width: 15%; text-align: right;">Unit Price</th>
                                <th style="width: 20%; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <!-- Banking, Paybill and Contact Details Grid -->
                    <div class="info-blocks-grid">
                        <div class="info-block">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0B6E40; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 13a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z"/></svg>
                                Bank Transfer Details
                            </div>
                            <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                                <strong>Bank:</strong> ${company.bankName}<br>
                                <strong>Account Name:</strong> ${company.bankAccName}<br>
                                <strong>Account No:</strong> ${company.bankAccNo}
                            </div>
                        </div>
                        <div class="info-block">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0B6E40; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.837 5 10.5 5c.663 0 1.292 1.193 1.764 1.979C12.74 7.783 13 8.826 13 10c0 1.174-.26 2.217-.736 2.979C11.792 13.807 11.163 15 10.5 15c-.663 0-1.292-1.193-1.764-1.979C8.26 12.217 8 11.174 8 10c0-1.174.26-2.217.736-2.979z" clip-rule="evenodd"/></svg>
                                Mobile Money Payment
                            </div>
                            <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                                <strong>M-Pesa Buy Goods Till:</strong> ${company.mpesaTillPaybill}<br>
                                <strong>Support Mobile:</strong> ${company.clinicPhone}<br>
                                <strong>Support Email:</strong> ${company.clinicEmail}
                            </div>
                        </div>
                    </div>

                    <!-- Summary & Breakdown -->
                    <div class="summary-box">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                            <span>Subtotal</span>
                            <span>KES ${Number(receiptData.totalAmount).toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                            <span>Payment Status</span>
                            <span style="font-weight: 700; color: ${statusColor}; text-transform: uppercase;">${statusLabel}</span>
                        </div>
                        ${!isInvoice ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 13px; font-weight: 600; color: #475569;">Payment Method</span>
                            <span style="font-size: 12px; font-weight: 700; background-color: #e6f4ea; color: #0B6E40; padding: 4px 10px; border-radius: 9999px;">${receiptData.paymentMethod}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 12px; border-top: 2px solid #e2e8f0; margin-top: 12px;">
                            <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${amountLabel}</span>
                            <span style="font-size: 20px; font-weight: 900; color: #0B6E40;">KES ${Number(receiptData.totalAmount).toLocaleString()}</span>
                        </div>
                    </div>

                    <!-- Footer Notes -->
                    <div class="footer-note">
                        <p style="margin: 0; font-weight: 700; color: #334155; font-size: 13px;">Thank you for choosing ${company.clinicName}.</p>
                        <p style="margin: 6px 0 0 0; color: #64748b;">This is a secure, officially verified medical record.</p>
                        
                        <!-- Social links -->
                        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 20px; font-size: 11px; font-weight: 600;">
                            <a href="${company.facebook}" target="_blank" style="color: #64748b; text-decoration: none;">Facebook</a>
                            <a href="${company.twitter}" target="_blank" style="color: #64748b; text-decoration: none;">Twitter / X</a>
                            <a href="${company.instagram}" target="_blank" style="color: #64748b; text-decoration: none;">Instagram</a>
                            <a href="${company.linkedin}" target="_blank" style="color: #64748b; text-decoration: none;">LinkedIn</a>
                        </div>

                        <p style="margin: 25px 0 0 0; font-size: 10px; color: #94a3b8; font-weight: 500;">
                            ${company.clinicName} • ${company.clinicAddress} • ${company.clinicEmail} • www.mclinic.co.ke
                        </p>
                    </div>

                    <!-- Print Trigger -->
                    <div class="action-bar no-print">
                        <button onclick="window.print()" class="print-btn">Print or Download PDF</button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        return {
            ...receiptData,
            html
        };
    }

    async generateReceiptByInvoiceId(invoiceId: number) {
        const tx = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .leftJoinAndSelect('invoice.appointment', 'appt')
            .leftJoinAndSelect('appt.patient', 'patientUser')
            .leftJoinAndSelect('appt.doctor', 'doctor')
            .leftJoinAndMapOne('appt.patientDetails', Patient, 'patientDetails', 'patientDetails.user_id = appt.patientId')
            .where('tx.invoiceId = :invoiceId', { invoiceId })
            .getOne();

        const invoice = tx?.invoice || await this.invoiceRepo.findOne({
            where: { id: invoiceId },
            relations: ['items']
        });

        if (!invoice) throw new NotFoundException('Invoice not found');

        const appt = invoice?.appointment;
        // @ts-ignore
        const patientDetails = appt?.patientDetails as Patient;
        const patientName = appt?.patient ? `${appt.patient.fname} ${appt.patient.lname}` : (invoice?.customerName || 'Patient');

        const company = await this.getCompanySettings();

        const currentStatus = tx?.status || invoice?.status || 'PENDING';
        const isInvoice = currentStatus.toLowerCase() !== 'completed' && currentStatus.toLowerCase() !== 'paid';
        const docTitle = isInvoice ? 'Official Invoice' : 'Official Receipt';
        const serialLabel = isInvoice ? 'Invoice No.' : 'Receipt Serial No.';
        const statusLabel = isInvoice ? 'PENDING' : 'COMPLETED';
        const statusColor = isInvoice ? '#f59e0b' : '#16a34a';
        const amountLabel = isInvoice ? 'Amount Due' : 'Amount Paid';

        const receiptData = {
            clinicName: company.clinicName,
            clinicAddress: company.clinicAddress,
            receiptNumber: tx?.reference || invoice?.invoiceNumber || `REC-${invoice?.id}`,
            date: tx?.createdAt || invoice?.createdAt || new Date(),
            patientName: patientName,
            insurance: patientDetails?.insurance_provider || 'N/A',
            doctor: appt?.doctor ? `${appt.doctor.fname} ${appt.doctor.lname}` : null,
            items: invoice?.items || [],
            totalAmount: tx?.amount || invoice?.totalAmount,
            paymentMethod: tx?.source || invoice?.paymentMethod || 'COMPLETED',
            status: currentStatus,
        };

        const rows = receiptData.items.map(item => `
            <tr>
                <td style="padding: 16px 12px; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${item.description}</td>
                <td style="padding: 16px 12px; text-align: center; color: #475569; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
                <td style="padding: 16px 12px; text-align: right; color: #475569; font-size: 14px; border-bottom: 1px solid #f1f5f9;">KES ${Number(item.unitPrice).toLocaleString()}</td>
                <td style="padding: 16px 12px; text-align: right; font-weight: 700; color: #0b6e40; font-size: 14px; border-bottom: 1px solid #f1f5f9;">KES ${Number(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
        `).join('');

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${company.clinicName} ${docTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    color: #1e293b;
                    margin: 0;
                    padding: 40px 20px;
                    background-color: #f8fafc;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .receipt-container {
                    max-width: 850px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    position: relative;
                }
                .receipt-header {
                    background: linear-gradient(135deg, #061F14 0%, #0B6E40 100%);
                    padding: 40px;
                    color: #ffffff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .receipt-body {
                    padding: 40px;
                }
                .meta-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                .details-card {
                    background-color: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 24px;
                }
                .verification-card {
                    background-color: #f0fdf4;
                    border: 1px dashed #bbf7d0;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }
                .receipt-table th {
                    background-color: #f8fafc;
                    padding: 16px 12px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #475569;
                    border-bottom: 2px solid #e2e8f0;
                }
                .receipt-table td {
                    padding: 16px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }
                .info-blocks-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .info-block {
                    background-color: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 20px;
                }
                .summary-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                    margin-left: auto;
                    width: 320px;
                }
                .footer-note {
                    text-align: center;
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px dashed #cbd5e1;
                    color: #64748b;
                    font-size: 12px;
                }
                .action-bar {
                    text-align: center;
                    margin-top: 30px;
                }
                .print-btn {
                    background-color: #0B6E40;
                    color: #ffffff;
                    border: none;
                    padding: 14px 28px;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(11, 110, 64, 0.2);
                    transition: all 0.2s ease;
                }
                .print-btn:hover {
                    background-color: #08522e;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(11, 110, 64, 0.3);
                }
                @media print {
                    body {
                        background-color: #ffffff;
                        padding: 0;
                    }
                    .receipt-container {
                        box-shadow: none;
                        border: none;
                        max-width: 100%;
                    }
                    .action-bar {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <!-- Header -->
                <div class="receipt-header">
                    <div>
                        <img src="${company.clinicLogo}" style="height: 55px; margin-bottom: 12px; border-radius: 8px;" alt="${company.clinicName} Logo">
                        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a7f3d0; opacity: 0.9;">${company.clinicTagline}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #a7f3d0; letter-spacing: 0.05em; margin-bottom: 4px;">${serialLabel}</div>
                        <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 4px;">${receiptData.receiptNumber}</div>
                        <div style="font-size: 13px; font-weight: 500; color: #e2e8f0;">${new Date(receiptData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>

                <div class="receipt-body">
                    <!-- Info & Verification Meta Grid -->
                    <div class="meta-grid">
                        <!-- Patient / Medic Info -->
                        <div class="details-card">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Patient Details</div>
                                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${receiptData.patientName}</div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Insurance: ${receiptData.insurance}</div>
                                </div>
                                <div>
                                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Practitioner / Service</div>
                                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${receiptData.doctor || 'M-Clinic Specialist'}</div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${company.clinicName}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Live Dynamic Verification QR Code -->
                        <div class="verification-card">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://portal.mclinic.co.ke/verify?code=' + receiptData.receiptNumber)}" style="width: 100px; height: 100px; border-radius: 8px; border: 4px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" alt="Verification QR">
                            <div style="font-size: 11px; font-weight: 700; color: #0B6E40; margin-top: 10px; display: flex; align-items: center; gap: 4px; justify-content: center;">
                                <svg style="width: 12px; height: 12px; fill: currentColor;" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                SECURE VERIFIED
                            </div>
                            <div style="font-size: 9px; color: #334155; margin-top: 4px;">Scan QR code to verify details</div>
                        </div>
                    </div>

                    <!-- Items table -->
                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th style="width: 55%;">Item Description</th>
                                <th style="width: 10%; text-align: center;">Qty</th>
                                <th style="width: 15%; text-align: right;">Unit Price</th>
                                <th style="width: 20%; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <!-- Banking, Paybill and Contact Details Grid -->
                    <div class="info-blocks-grid">
                        <div class="info-block">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0B6E40; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 13a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z"/></svg>
                                Bank Transfer Details
                            </div>
                            <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                                <strong>Bank:</strong> ${company.bankName}<br>
                                <strong>Account Name:</strong> ${company.bankAccName}<br>
                                <strong>Account No:</strong> ${company.bankAccNo}
                            </div>
                        </div>
                        <div class="info-block">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0B6E40; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.837 5 10.5 5c.663 0 1.292 1.193 1.764 1.979C12.74 7.783 13 8.826 13 10c0 1.174-.26 2.217-.736 2.979C11.792 13.807 11.163 15 10.5 15c-.663 0-1.292-1.193-1.764-1.979C8.26 12.217 8 11.174 8 10c0-1.174.26-2.217.736-2.979z" clip-rule="evenodd"/></svg>
                                Mobile Money Payment
                            </div>
                            <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                                <strong>M-Pesa Buy Goods Till:</strong> ${company.mpesaTillPaybill}<br>
                                <strong>Support Mobile:</strong> ${company.clinicPhone}<br>
                                <strong>Support Email:</strong> ${company.clinicEmail}
                            </div>
                        </div>
                    </div>

                    <!-- Summary & Breakdown -->
                    <div class="summary-box">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                            <span>Subtotal</span>
                            <span>KES ${Number(receiptData.totalAmount).toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                            <span>Payment Status</span>
                            <span style="font-weight: 700; color: ${statusColor}; text-transform: uppercase;">${statusLabel}</span>
                        </div>
                        ${!isInvoice ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 13px; font-weight: 600; color: #475569;">Payment Method</span>
                            <span style="font-size: 12px; font-weight: 700; background-color: #e6f4ea; color: #0B6E40; padding: 4px 10px; border-radius: 9999px;">${receiptData.paymentMethod}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 12px; border-top: 2px solid #e2e8f0; margin-top: 12px;">
                            <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${amountLabel}</span>
                            <span style="font-size: 20px; font-weight: 900; color: #0B6E40;">KES ${Number(receiptData.totalAmount).toLocaleString()}</span>
                        </div>
                    </div>

                    <!-- Footer Notes -->
                    <div class="footer-note">
                        <p style="margin: 0; font-weight: 700; color: #334155; font-size: 13px;">Thank you for choosing ${company.clinicName}.</p>
                        <p style="margin: 6px 0 0 0; color: #64748b;">This is a secure, officially verified medical record.</p>
                        
                        <!-- Social links -->
                        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 20px; font-size: 11px; font-weight: 600;">
                            <a href="${company.facebook}" target="_blank" style="color: #64748b; text-decoration: none;">Facebook</a>
                            <a href="${company.twitter}" target="_blank" style="color: #64748b; text-decoration: none;">Twitter / X</a>
                            <a href="${company.instagram}" target="_blank" style="color: #64748b; text-decoration: none;">Instagram</a>
                            <a href="${company.linkedin}" target="_blank" style="color: #64748b; text-decoration: none;">LinkedIn</a>
                        </div>

                        <p style="margin: 25px 0 0 0; font-size: 10px; color: #94a3b8; font-weight: 500;">
                            ${company.clinicName} • ${company.clinicAddress} • ${company.clinicEmail} • www.mclinic.co.ke
                        </p>
                    </div>

                    <!-- Print Trigger -->
                    <div class="action-bar no-print">
                        <button onclick="window.print()" class="print-btn">Print or Download PDF</button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        return {
            ...receiptData,
            html
        };
    }

    async verifyReceipt(code: string) {
        if (!code) throw new NotFoundException('Verification code is required');
        
        let tx = await this.txRepo.findOne({
            where: { reference: code }
        });
        
        if (!tx && /^\d+$/.test(code)) {
            tx = await this.txRepo.findOne({
                where: { id: Number(code) }
            });
        }
        
        if (!tx && code.startsWith('REC-')) {
            const numPart = code.replace('REC-', '');
            if (/^\d+$/.test(numPart)) {
                tx = await this.txRepo.findOne({
                    where: { id: Number(numPart) }
                });
            }
        }
        
        if (tx) {
            return this.generateReceipt(tx.id);
        }
        
        let invoice = await this.invoiceRepo.findOne({
            where: { invoiceNumber: code }
        });
        
        if (!invoice && /^\d+$/.test(code)) {
            invoice = await this.invoiceRepo.findOne({
                where: { id: Number(code) }
            });
        }
        
        if (!invoice && code.startsWith('INV-')) {
            const numPart = code.replace('INV-', '');
            if (/^\d+$/.test(numPart)) {
                invoice = await this.invoiceRepo.findOne({
                    where: { id: Number(numPart) }
                });
            }
        }
        
        if (invoice) {
            const invoiceTx = await this.txRepo.findOne({
                where: { invoiceId: invoice.id }
            });
            if (invoiceTx) {
                return this.generateReceipt(invoiceTx.id);
            }
            return this.generateReceiptByInvoiceId(invoice.id);
        }
        
        throw new NotFoundException(`No verified receipt or invoice found for serial: "${code}"`);
    }
}
