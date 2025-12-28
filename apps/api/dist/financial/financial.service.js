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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_config_entity_1 = require("./entities/payment-config.entity");
const service_price_entity_1 = require("./entities/service-price.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const invoice_entity_1 = require("./entities/invoice.entity");
const invoice_item_entity_1 = require("./entities/invoice-item.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
const wallets_service_1 = require("../wallets/wallets.service");
let FinancialService = class FinancialService {
    configRepo;
    priceRepo;
    txRepo;
    invoiceRepo;
    invoiceItemRepo;
    doctorRepo;
    walletsService;
    constructor(configRepo, priceRepo, txRepo, invoiceRepo, invoiceItemRepo, doctorRepo, walletsService) {
        this.configRepo = configRepo;
        this.priceRepo = priceRepo;
        this.txRepo = txRepo;
        this.invoiceRepo = invoiceRepo;
        this.invoiceItemRepo = invoiceItemRepo;
        this.doctorRepo = doctorRepo;
        this.walletsService = walletsService;
    }
    async setConfig(provider, credentials) {
        let config = await this.configRepo.findOne({ where: { provider } });
        if (!config) {
            config = this.configRepo.create({ provider });
        }
        config.credentials = JSON.stringify(credentials);
        return this.configRepo.save(config);
    }
    async getConfig(provider) {
        return this.configRepo.findOne({ where: { provider } });
    }
    async setPrice(serviceName, amount, doctorId) {
        const where = { serviceName };
        if (doctorId) {
            where.doctorId = doctorId;
        }
        else {
            where.doctorId = (0, typeorm_2.IsNull)();
        }
        let existingPrice = await this.priceRepo.findOne({ where });
        let priceToSave;
        if (existingPrice) {
            priceToSave = existingPrice;
        }
        else {
            priceToSave = this.priceRepo.create({
                serviceName,
                doctorId: doctorId || null,
            });
        }
        priceToSave.amount = amount;
        return this.priceRepo.save(priceToSave);
    }
    async getPrices(doctorId) {
        const query = this.priceRepo.createQueryBuilder('price')
            .where('price.doctorId IS NULL');
        if (doctorId) {
            query.orWhere('price.doctorId = :doctorId', { doctorId });
        }
        return query.getMany();
    }
    async recordTransaction(data) {
        const tx = this.txRepo.create(data);
        return this.txRepo.save(tx);
    }
    async getAllTransactions() {
        return this.txRepo.find({ order: { createdAt: 'DESC' }, relations: ['user'] });
    }
    async createInvoice(data) {
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
            status: invoice_entity_1.InvoiceStatus.PENDING,
            items,
        });
        return this.invoiceRepo.save(invoice);
    }
    async getInvoices(user) {
        const query = this.invoiceRepo.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .leftJoinAndSelect('invoice.appointment', 'appointment')
            .orderBy('invoice.createdAt', 'DESC');
        if (user.role === 'patient') {
            query.where('invoice.customerEmail = :email', { email: user.email })
                .orWhere('appointment.patientId = :userId', { userId: user.id });
        }
        else if (user.role === 'doctor') {
            const doctor = await this.doctorRepo.findOne({ where: { email: user.email } });
            if (doctor) {
                query.where('invoice.doctorId = :doctorId', { doctorId: doctor.id });
            }
            else {
                return [];
            }
        }
        return query.getMany();
    }
    async getInvoiceById(id) {
        const invoice = await this.invoiceRepo.findOne({ where: { id }, relations: ['items'] });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async updateInvoice(id, data) {
        const invoice = await this.getInvoiceById(id);
        if (data.items) {
            await this.invoiceItemRepo.delete({ invoice: { id: id } });
            let totalAmount = 0;
            invoice.items = data.items.map((item) => {
                const amount = item.quantity * item.unitPrice;
                totalAmount += amount;
                return this.invoiceItemRepo.create({
                    ...item,
                    amount,
                });
            });
            invoice.totalAmount = totalAmount;
        }
        if (data.customerName)
            invoice.customerName = data.customerName;
        if (data.customerEmail)
            invoice.customerEmail = data.customerEmail;
        if (data.dueDate)
            invoice.dueDate = data.dueDate;
        if (data.status)
            invoice.status = data.status;
        return this.invoiceRepo.save(invoice);
    }
    async deleteInvoice(id) {
        const invoice = await this.getInvoiceById(id);
        await this.invoiceRepo.remove(invoice);
    }
    async getStats(user) {
        console.log(`[FINANCIAL] getStats service called with role: '${user?.role}' (Comparison: ${user?.role === 'doctor'})`);
        if (user && user.role?.toLowerCase() === 'doctor') {
            return this.getDoctorStats(user);
        }
        const paidStats = await this.invoiceRepo
            .createQueryBuilder('inv')
            .select('SUM(inv.totalAmount)', 'total')
            .where('inv.status = :status', { status: invoice_entity_1.InvoiceStatus.PAID })
            .getRawOne();
        const paidAmount = parseFloat(paidStats?.total || '0');
        const pendingStats = await this.invoiceRepo
            .createQueryBuilder('inv')
            .select('SUM(inv.totalAmount)', 'total')
            .where('inv.status = :status', { status: invoice_entity_1.InvoiceStatus.PENDING })
            .getRawOne();
        const pendingAmount = parseFloat(pendingStats?.total || '0');
        const overdueStats = await this.invoiceRepo
            .createQueryBuilder('inv')
            .select('SUM(inv.totalAmount)', 'total')
            .where('inv.status = :status', { status: invoice_entity_1.InvoiceStatus.OVERDUE })
            .getRawOne();
        const overdueAmount = parseFloat(overdueStats?.total || '0');
        const totalRevenue = paidAmount;
        const totalTransactions = await this.txRepo.count();
        const recentTransactions = await this.txRepo.find({
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['user', 'invoice', 'invoice.appointment', 'invoice.appointment.patient', 'invoice.appointment.doctor']
        });
        const pendingInvoicesCount = await this.invoiceRepo.count({ where: { status: invoice_entity_1.InvoiceStatus.PENDING } });
        const paidInvoicesCount = await this.invoiceRepo.count({ where: { status: invoice_entity_1.InvoiceStatus.PAID } });
        const overdueInvoicesCount = await this.invoiceRepo.count({ where: { status: invoice_entity_1.InvoiceStatus.OVERDUE } });
        const sourceStats = await this.txRepo
            .createQueryBuilder('tx')
            .select('tx.source', 'source')
            .addSelect('COUNT(tx.id)', 'count')
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
            if (source.includes('MPESA'))
                paymentStats.mpesa += total;
            else if (source.includes('VISA') || source.includes('CARD'))
                paymentStats.visa += total;
            else if (source.includes('PAYPAL'))
                paymentStats.paypal += total;
            else if (source.includes('CASH'))
                paymentStats.cash += total;
            else
                paymentStats.others += total;
        });
        const netRevenue = totalRevenue * 0.40;
        return {
            totalRevenue,
            netRevenue,
            totalTransactions,
            recentTransactions,
            invoices: {
                pending: pendingInvoicesCount,
                paid: paidInvoicesCount,
                overdue: overdueInvoicesCount,
                total: pendingInvoicesCount + paidInvoicesCount + overdueInvoicesCount,
                mk_pendingAmount: pendingAmount,
                mk_paidAmount: paidAmount,
                mk_overdueAmount: overdueAmount,
                pendingAmount,
                paidAmount
            },
            paymentStats
        };
    }
    async getDoctorStats(user) {
        const email = user.email.trim();
        const doctor = await this.doctorRepo.findOne({ where: { email } });
        if (!doctor) {
            console.error(`[FINANCIAL] getDoctorStats: FAILED to find doctor with email '${email}'`);
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        console.log(`[FINANCIAL] getDoctorStats: Found doctor ${doctor.email} (ID: ${doctor.id}) for User ID: ${user.id}`);
        let balance = 0;
        try {
            const wallet = await this.walletsService.getBalanceByEmail(doctor.email);
            balance = Number(wallet.balance);
        }
        catch (e) {
            console.warn(`[FINANCIAL] No wallet found for ${doctor.email}, using legacy balance.`);
            balance = Number(doctor.balance);
        }
        const pendingTransactions = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .where('inv.doctorId = :doctorId', { doctorId: doctor.id })
            .andWhere('tx.status = :status', { status: transaction_entity_1.TransactionStatus.PENDING })
            .getMany();
        let pendingClearance = 0;
        pendingTransactions.forEach(tx => {
            if (tx.invoice) {
                const total = Number(tx.invoice.totalAmount);
                const commission = Number(tx.invoice.commissionAmount || 0);
                pendingClearance += (total - commission);
            }
        });
        const transactions = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .leftJoinAndSelect('tx.user', 'user')
            .leftJoinAndSelect('inv.appointment', 'appt')
            .leftJoinAndSelect('appt.patient', 'patient')
            .where('tx.userId = :userId', { userId: user.id })
            .orWhere('inv.doctorId = :doctorId', { doctorId: doctor.id })
            .orderBy('tx.createdAt', 'DESC')
            .take(10)
            .getMany();
        return {
            balance,
            pendingClearance,
            transactions
        };
    }
    async initiateMpesaPayment(phoneNumber, amount, invoiceId) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        const checkoutRequestId = `MCL${Date.now()}`;
        console.log(`[MPESA] Initiating STK Push to ${phoneNumber} for KES ${amount}`);
        console.log(`[MPESA] CheckoutRequestID: ${checkoutRequestId}`);
        setTimeout(async () => {
            await this.handleMpesaCallback({
                Body: {
                    stkCallback: {
                        ResultCode: 0,
                        ResultDesc: 'The service request is processed successfully.',
                        CheckoutRequestID: checkoutRequestId,
                        CallbackMetadata: {
                            Item: [
                                { Name: 'Amount', Value: amount },
                                { Name: 'MpesaReceiptNumber', Value: `MPE${Date.now()}` },
                                { Name: 'PhoneNumber', Value: phoneNumber }
                            ]
                        }
                    }
                }
            });
        }, 5000);
        return {
            success: true,
            message: 'STK Push sent. Please check your phone.',
            checkoutRequestId
        };
    }
    async handleMpesaCallback(callbackData) {
        try {
            const callback = callbackData?.Body?.stkCallback;
            if (!callback)
                return { success: false };
            const resultCode = callback.ResultCode;
            if (resultCode === 0) {
                const metadata = callback.CallbackMetadata?.Item || [];
                const receiptNumber = metadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value;
                const amount = metadata.find((item) => item.Name === 'Amount')?.Value;
                const invoice = await this.invoiceRepo.findOne({
                    where: {
                        totalAmount: amount,
                        status: invoice_entity_1.InvoiceStatus.PENDING
                    }
                });
                if (invoice) {
                    invoice.status = invoice_entity_1.InvoiceStatus.PAID;
                    if (invoice.invoiceNumber && invoice.invoiceNumber.startsWith('AMB-SUB-')) {
                        const parts = invoice.invoiceNumber.split('-');
                        const subId = parts[2];
                        if (subId) {
                            try {
                                await this.invoiceRepo.query('UPDATE ambulance_subscriptions SET status = ? WHERE id = ?', ['active', subId]);
                                console.log(`[FINANCIAL] Activated Ambulance Subscription #${subId}`);
                            }
                            catch (e) {
                                console.error(`[FINANCIAL] Failed to activate subscription #${subId}:`, e);
                            }
                        }
                    }
                    if (invoice.doctorId) {
                        let doctorShare = 0;
                        let commission = 0;
                        const parts = invoice.invoiceNumber.split('-');
                        const appId = parts.length > 2 ? parseInt(parts[2]) : null;
                        if (appId) {
                            const app = await this.doctorRepo.manager.createQueryBuilder('appointment', 'a')
                                .where('a.id = :id', { id: appId })
                                .getOne();
                            if (app) {
                                const fee = Number(app.fee || 0);
                                const transport = Number(app.transportFee || 0);
                                commission = fee * 0.40;
                                doctorShare = (fee * 0.60) + transport;
                            }
                            else {
                                const total = Number(invoice.totalAmount);
                                commission = total * 0.40;
                                doctorShare = total * 0.60;
                            }
                        }
                        else {
                            const total = Number(invoice.totalAmount);
                            commission = total * 0.40;
                            doctorShare = total * 0.60;
                        }
                        invoice.commissionAmount = commission;
                        invoice.commissionAmount = commission;
                        const doctor = await this.doctorRepo.findOne({ where: { id: invoice.doctorId } });
                        if (doctor && doctor.email) {
                            await this.walletsService.creditByEmail(doctor.email, doctorShare, `Credit for Invoice #${invoice.invoiceNumber}`);
                        }
                    }
                    await this.invoiceRepo.save(invoice);
                    const transaction = this.txRepo.create({
                        amount,
                        source: 'MPESA',
                        reference: receiptNumber,
                        status: transaction_entity_1.TransactionStatus.COMPLETED,
                        invoice: invoice,
                        invoiceId: invoice.id
                    });
                    await this.txRepo.save(transaction);
                    console.log(`[MPESA] Payment confirmed for Invoice #${invoice.invoiceNumber}`);
                }
            }
            else {
                console.log(`[MPESA] Payment failed: ${callback.ResultDesc}`);
            }
            return { success: true };
        }
        catch (error) {
            console.error('[MPESA] Callback error:', error);
            return { success: false };
        }
    }
    async processPayment(appointmentId, amount, phoneNumber) {
        let invoice = await this.invoiceRepo.createQueryBuilder('inv')
            .where('inv.invoiceNumber LIKE :suffix', { suffix: `%-${appointmentId}` })
            .getOne();
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found for this appointment');
        invoice.status = invoice_entity_1.InvoiceStatus.PAID;
        await this.invoiceRepo.save(invoice);
        if (invoice.doctorId) {
            const doctorShare = amount * 0.60;
            const commission = amount * 0.40;
            invoice.commissionAmount = commission;
            await this.invoiceRepo.save(invoice);
            const doctor = await this.doctorRepo.findOne({ where: { id: invoice.doctorId } });
            if (doctor && doctor.email) {
                await this.walletsService.creditByEmail(doctor.email, doctorShare, `Payment for Appointment #${appointmentId}`);
            }
        }
        const transaction = this.txRepo.create({
            amount: amount,
            source: 'MPESA',
            reference: `MPE${Date.now()}`,
            status: transaction_entity_1.TransactionStatus.COMPLETED,
            invoice: invoice,
            invoiceId: invoice.id
        });
        await this.txRepo.save(transaction);
        await this.doctorRepo.manager.update('appointment', { id: appointmentId }, { status: 'confirmed' });
        return { success: true, message: 'Payment processed successfully' };
    }
    async confirmInvoicePayment(invoiceId, paymentMethod, transactionId) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (invoice.status === invoice_entity_1.InvoiceStatus.PAID)
            throw new common_1.BadRequestException('Invoice already paid');
        invoice.status = invoice_entity_1.InvoiceStatus.PAID;
        await this.invoiceRepo.save(invoice);
        if (invoice.doctorId) {
            const total = Number(invoice.totalAmount);
            const doctorShare = total * 0.60;
            const commission = total * 0.40;
            invoice.commissionAmount = commission;
            await this.invoiceRepo.save(invoice);
            const doctor = await this.doctorRepo.findOne({ where: { id: invoice.doctorId } });
            if (doctor && doctor.email) {
                await this.walletsService.creditByEmail(doctor.email, doctorShare, `Manual Payment for Invoice #${invoiceId}`);
            }
        }
        const transaction = this.txRepo.create({
            amount: invoice.totalAmount,
            source: paymentMethod.toUpperCase(),
            reference: transactionId || `MAN${Date.now()}`,
            status: transaction_entity_1.TransactionStatus.COMPLETED,
            invoice: invoice,
            invoiceId: invoice.id
        });
        await this.txRepo.save(transaction);
        if (invoice.invoiceNumber && invoice.invoiceNumber.startsWith('AMB-SUB-')) {
            const parts = invoice.invoiceNumber.split('-');
            const subId = parts[2];
            if (subId) {
                await this.invoiceRepo.query('UPDATE ambulance_subscriptions SET status = ? WHERE id = ?', ['active', subId]);
            }
        }
        else {
            const parts = invoice.invoiceNumber.split('-');
            const appId = parts.length > 2 ? parseInt(parts[2]) : null;
            if (appId && parts[0] === 'INV') {
                await this.doctorRepo.manager.update('appointment', { id: appId }, { status: 'confirmed' });
            }
        }
        return { success: true, message: 'Payment confirmed successfully', invoice };
    }
    async releaseFunds(appointmentId) {
        console.log(`[FINANCIAL] releaseFunds called for Appointment #${appointmentId} - (Funds already released on payment)`);
        const transaction = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.invoice', 'inv')
            .where('inv.invoiceNumber LIKE :suffix', { suffix: `%-${appointmentId}` })
            .andWhere('tx.status = :status', { status: transaction_entity_1.TransactionStatus.PENDING })
            .getOne();
        if (transaction) {
            transaction.status = transaction_entity_1.TransactionStatus.COMPLETED;
            await this.txRepo.save(transaction);
            if (transaction.invoice && transaction.invoice.doctorId) {
                const total = Number(transaction.amount);
                const doctorShare = total * 0.60;
                const doctor = await this.doctorRepo.findOne({ where: { id: transaction.invoice.doctorId } });
                if (doctor && doctor.email) {
                    await this.walletsService.creditByEmail(doctor.email, doctorShare, `Release released for Appt #${appointmentId}`);
                }
            }
        }
    }
    async withdrawFunds(user, amount, method, details) {
        if (!method || !details)
            throw new common_1.BadRequestException('Withdrawal method and details required');
        const doctor = await this.doctorRepo.findOne({ where: { email: user.email } });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor account not found');
        }
        const wallet = await this.walletsService.getBalanceByEmail(user.email);
        const balance = Number(wallet.balance);
        if (balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        await this.walletsService.debitByEmail(user.email, amount, `Withdrawal: ${method} - ${details}`);
        doctor.balance = balance - amount;
        await this.doctorRepo.save(doctor);
        const transaction = this.txRepo.create({
            amount: amount,
            source: 'WITHDRAWAL',
            reference: `${method}-${details}`,
            status: transaction_entity_1.TransactionStatus.COMPLETED,
            user: { id: user.id },
            userId: user.id,
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
    async recalculateDoctorBalance(doctorId) {
        const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        console.log(`[FINANCIAL] Reconciling Balance for Doctor: ${doctor.email} (ID: ${doctor.id})`);
        const invoices = await this.invoiceRepo.find({
            where: {
                doctorId: doctorId,
                status: invoice_entity_1.InvoiceStatus.PAID
            }
        });
        let totalEarnings = 0;
        invoices.forEach(inv => {
            const total = Number(inv.totalAmount);
            const commission = Number(inv.commissionAmount || (total * 0.40));
            const doctorShare = total - commission;
            totalEarnings += doctorShare;
        });
        console.log(`[FINANCIAL] Total Earnings (Paid Invoices): ${totalEarnings}`);
        const withdrawals = await this.txRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.user', 'user')
            .where('tx.type = :type', { type: 'debit' })
            .andWhere('tx.status = :status', { status: transaction_entity_1.TransactionStatus.COMPLETED })
            .andWhere('(user.email = :email OR tx.userId = (SELECT id FROM user WHERE email = :email))', { email: doctor.email })
            .getMany();
        let totalWithdrawals = 0;
        withdrawals.forEach(tx => {
            totalWithdrawals += Number(tx.amount);
        });
        console.log(`[FINANCIAL] Total Withdrawals: ${totalWithdrawals}`);
        const newBalance = totalEarnings - totalWithdrawals;
        console.log(`[FINANCIAL] New Balance: ${newBalance} (Old: ${doctor.balance})`);
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
                }
                catch (e) {
                    results.push({ email: doctor.email, error: e.message, status: 'Failed' });
                }
            }
            else {
                if (doctor.email) {
                    try {
                        await this.walletsService.getBalanceByEmail(doctor.email);
                    }
                    catch (e) { }
                }
            }
        }
        return { success: true, migratedCount, details: results };
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_config_entity_1.PaymentConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(service_price_entity_1.ServicePrice)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(4, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __param(5, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        wallets_service_1.WalletsService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map