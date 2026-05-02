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

        return this.invoiceRepo.save(invoice);
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
            console.error(`[FINANCIAL] getDoctorStats: FAILED to find doctor with email '${email}' or ID ${userId}`);
            throw new NotFoundException('Doctor profile not found');
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
                const doctor = await this.doctorRepo.findOne({ where: { id: invoice.doctorId } });
                if (doctor && doctor.email) {
                    await this.walletsService.creditByEmail(doctor.email, doctorShare, `Payment for Appointment #${appointmentId}`);
                }
            }
        }

        // Record Transaction as COMPLETED (Funds Available)
        const transaction = this.txRepo.create({
            amount: amount,
            source: 'MPESA',
            reference: `MPE${Date.now()}`,
            status: TransactionStatus.COMPLETED, // Funds Available Immediately
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
            // Strict Check: ONLY credit for Bookings/Appointments
            const isAppointmentInvoice = invoice.invoiceNumber?.startsWith('INV-') || invoice.appointmentId;

            if (isAppointmentInvoice) {
                const total = Number(invoice.totalAmount);
                const doctorShare = total * 0.60;
                const commission = total * 0.40;

                invoice.commissionAmount = commission;
                await this.invoiceRepo.save(invoice);

                const doctor = await this.doctorRepo.findOne({ where: { id: invoice.doctorId } });
                if (doctor && doctor.email) {
                    await this.walletsService.creditByEmail(doctor.email, doctorShare, `Payment for Invoice #${invoiceId}`);
                }

                // Update Appointment Status
                let appId: number | null = invoice.appointmentId;
                // Fallback
                if (!appId && invoice.invoiceNumber && invoice.invoiceNumber.startsWith('INV-')) {
                    const parts = invoice.invoiceNumber.split('-');
                    appId = parts.length > 2 ? parseInt(parts[2]) : null;
                }

                if (appId) {
                    try {
                        console.log(`[FINANCIAL] Confirming Appointment #${appId} for Paid Invoice #${invoiceId}`);
                        await this.doctorRepo.manager.update('appointment', { id: appId }, { status: 'confirmed' });
                    } catch (err) {
                        console.error(`[FINANCIAL] Failed to update appointment status for #${appId}:`, err);
                    }
                }
            } else {
                console.log(`[FINANCIAL] Skipped Wallet Credit/Appt Update for Non-Appointment Invoice #${invoice.invoiceNumber}`);
            }
        }

        // Create transaction record
        const transaction = this.txRepo.create({
            amount: invoice.totalAmount,
            source: paymentMethod.toUpperCase(),
            reference: transactionId || `MAN${Date.now()}`,
            status: TransactionStatus.COMPLETED,
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

        let appId: number | null = invoice.appointmentId;
        if (!appId && invoice.invoiceNumber && invoice.invoiceNumber.startsWith('INV-')) {
            const parts = invoice.invoiceNumber.split('-');
            appId = parts.length > 2 ? parseInt(parts[2]) : null;
        }

        if (appId) {
            await this.sendConfirmationSms(appId);
        }

        return { success: true, message: 'Payment confirmed successfully', invoice };
    }

    private async sendConfirmationSms(appointmentId: number) {
        try {
            const appt = await this.invoiceRepo.manager.getRepository(Appointment).findOne({
                where: { id: appointmentId },
                relations: ['patient', 'doctor']
            });

            if (appt && appt.patient && appt.doctor) {
                const patient = appt.patient;
                const doctor = appt.doctor;
                const portalUrl = 'https://portal.mclinic.co.ke';
                const apptTime = `${new Date(appt.appointment_date).toDateString()} @ ${appt.appointment_time}`;

                // 1. SMS to Patient: Confirmation + Doctor Contact
                const patientMsg = `Appointment Confirmed! You have an appointment with Dr. ${doctor.fname} ${doctor.lname} on ${apptTime}. Medic Contact: ${doctor.mobile || 'N/A'}. View details: ${portalUrl}/dashboard/appointments`;
                await this.notificationService.sendCustomSms(patient.mobile, patientMsg);

                // 2. SMS to Doctor: Confirmation + Patient Contact
                const doctorMsg = `Confirmed Appointment: ${patient.fname} ${patient.lname} has paid for their appointment on ${apptTime}. Patient Contact: ${patient.mobile || 'N/A'}. View details: ${portalUrl}/dashboard/appointments`;
                await this.notificationService.sendCustomSms(doctor.mobile, doctorMsg);

                // 3. Notify Admin
                await this.notificationService.notifyAdmin(
                    'booking',
                    `Payment Confirmed for Appt #${appointmentId}: ${patient.fname} vs Dr. ${doctor.lname}. Notification sent to both.`
                );
            }
        } catch (error) {
            console.error('[Financial] Failed to send post-payment SMS notifications', error);
        }
    }

    // Release Funds (Called when Appointment is COMPLETED)
    async releaseFunds(appointmentId: number) {
        console.log(`[FINANCIAL] releaseFunds called for Appointment #${appointmentId} - (Funds already released on payment)`);
        // Funds are now released immediately upon payment. 
        // We can use this method to handle any final reconciliations or just ensure transaction status is correct.

        // Ensure legacy pending transactions are marked completed?
        const transaction = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .where('inv.invoiceNumber LIKE :suffix', { suffix: `%-${appointmentId}` })
            .andWhere('inv.invoiceNumber LIKE :prefix', { prefix: 'INV-%' }) // Strict Prefix Check
            .andWhere('tx.status = :status', { status: TransactionStatus.PENDING })
            .getOne();

        if (transaction) {
            // If there WAS a pending transaction (from old logic), release it now.
            transaction.status = TransactionStatus.COMPLETED;
            await this.txRepo.save(transaction);

            if (transaction.invoice && transaction.invoice.doctorId) {
                const total = Number(transaction.amount);
                const doctorShare = total * 0.60;
                // DEPRECATED: await this.doctorRepo.increment({ id: transaction.invoice.doctorId }, 'balance', doctorShare);
                const doctor = await this.doctorRepo.findOne({ where: { id: transaction.invoice.doctorId } });
                if (doctor && doctor.email) {
                    await this.walletsService.creditByEmail(doctor.email, doctorShare, `Release released for Appt #${appointmentId}`);
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

        const receiptData = {
            clinicName: "M-Clinic Services",
            clinicAddress: "Nairobi, Kenya",
            receiptNumber: tx.reference || `REC-${tx.id}`,
            date: tx.createdAt,
            patientName: patientName,
            insurance: patientDetails?.insurance_provider || 'N/A',
            doctor: appt?.doctor ? `${appt.doctor.fname} ${appt.doctor.lname}` : null,
            items: invoice?.items || [],
            totalAmount: tx.amount,
            paymentMethod: tx.source,
            status: tx.status
        };

        const rows = receiptData.items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.unitPrice}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.amount}</td>
            </tr>
        `).join('');

        const html = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); color: #333;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px;">
                    <div>
                        <img src="https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png" style="height: 60px; margin-bottom: 20px;" alt="M-Clinic Logo">
                        <h1 style="margin: 0; color: #16a34a; font-size: 28px; font-weight: 800;">OFFICIAL RECEIPT</h1>
                        <p style="color: #666; font-size: 14px; margin-top: 5px;">${receiptData.clinicName}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; color: #999; font-size: 12px; font-weight: 700; text-transform: uppercase;">Receipt Number</p>
                        <p style="margin: 0 0 15px 0; font-weight: 700; font-size: 18px; color: #111;">${receiptData.receiptNumber}</p>
                        <p style="margin: 0; color: #999; font-size: 12px; font-weight: 700; text-transform: uppercase;">Date</p>
                        <p style="margin: 0; font-weight: 600; color: #444;">${new Date(receiptData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                    <div>
                        <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Patient Details</h3>
                        <p style="margin: 0; font-weight: 700; font-size: 16px;">${receiptData.patientName}</p>
                        ${receiptData.insurance !== 'N/A' ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Insurance: ${receiptData.insurance}</p>` : ''}
                    </div>
                    <div>
                        <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Provider Details</h3>
                        <p style="margin: 0; font-weight: 700; font-size: 16px;">${receiptData.doctor || 'M-Clinic Specialist'}</p>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">M-Clinic Health Centre</p>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="border-bottom: 2px solid #16a34a;">
                            <th style="padding: 15px 10px; text-align: left; font-size: 13px; color: #16a34a; text-transform: uppercase;">Description</th>
                            <th style="padding: 15px 10px; text-align: center; font-size: 13px; color: #16a34a; text-transform: uppercase;">Qty</th>
                            <th style="padding: 15px 10px; text-align: right; font-size: 13px; color: #16a34a; text-transform: uppercase;">Unit Price</th>
                            <th style="padding: 15px 10px; text-align: right; font-size: 13px; color: #16a34a; text-transform: uppercase;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receiptData.items.map(item => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 15px 10px; font-weight: 600;">${item.description}</td>
                                <td style="padding: 15px 10px; text-align: center; color: #666;">${item.quantity}</td>
                                <td style="padding: 15px 10px; text-align: right; color: #666;">KES ${Number(item.unitPrice).toLocaleString()}</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: 700;">KES ${Number(item.amount).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-left: auto; width: 300px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #666; font-weight: 600;">Payment Method:</span>
                        <span style="font-weight: 700; color: #16a34a;">${receiptData.paymentMethod}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #ddd;">
                        <span style="font-size: 18px; font-weight: 800; color: #111;">TOTAL PAID</span>
                        <span style="font-size: 20px; font-weight: 900; color: #16a34a;">KES ${Number(receiptData.totalAmount).toLocaleString()}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px dashed #ddd;">
                    <p style="margin: 0; color: #111; font-weight: 700;">Thank you for choosing M-Clinic.</p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">This is a computer-generated receipt. No signature required.</p>
                    <p style="margin: 15px 0 0 0; font-size: 11px; color: #bbb;">M-Clinic Kenya • Nairobi • support@mclinic.co.ke</p>
                </div>

                <div style="margin-top: 40px; text-align: center; no-print">
                    <button onclick="window.print()" style="padding: 12px 30px; background-color: #16a34a; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(22,163,74,0.3);">Print or Download PDF</button>
                </div>

                <style>
                    @media print {
                        button { display: none; }
                        body { background: white; margin: 0; padding: 0; }
                        div { box-shadow: none !important; border: none !important; margin: 0 !important; }
                    }
                </style>
            </div>
        `;

        return {
            ...receiptData,
            html
        };
    }
}
