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
let FinancialService = class FinancialService {
    configRepo;
    priceRepo;
    txRepo;
    invoiceRepo;
    constructor(configRepo, priceRepo, txRepo, invoiceRepo) {
        this.configRepo = configRepo;
        this.priceRepo = priceRepo;
        this.txRepo = txRepo;
        this.invoiceRepo = invoiceRepo;
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
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
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
    async getInvoices() {
        return this.invoiceRepo.find({ order: { createdAt: 'DESC' }, relations: ['items'] });
    }
    async getStats() {
        const result = await this.txRepo
            .createQueryBuilder('tx')
            .select('SUM(tx.amount)', 'total')
            .where('tx.status IN (:...statuses)', { statuses: [transaction_entity_1.TransactionStatus.COMPLETED, transaction_entity_1.TransactionStatus.SUCCESS] })
            .getRawOne();
        const totalRevenue = result ? parseFloat(result.total) || 0 : 0;
        const totalTransactions = await this.txRepo.count();
        const recentTransactions = await this.txRepo.find({
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['user']
        });
        const pendingInvoices = await this.invoiceRepo.count({ where: { status: invoice_entity_1.InvoiceStatus.PENDING } });
        const paidInvoices = await this.invoiceRepo.count({ where: { status: invoice_entity_1.InvoiceStatus.PAID } });
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
        return {
            totalRevenue,
            totalTransactions,
            recentTransactions,
            invoices: {
                pending: pendingInvoices,
                paid: paidInvoices,
                total: pendingInvoices + paidInvoices
            },
            paymentStats
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
                    await this.invoiceRepo.save(invoice);
                    const transaction = this.txRepo.create({
                        amount,
                        source: 'MPESA',
                        reference: receiptNumber,
                        status: transaction_entity_1.TransactionStatus.COMPLETED
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
    async confirmInvoicePayment(invoiceId, paymentMethod, transactionId) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (invoice.status === invoice_entity_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('Invoice already paid');
        }
        invoice.status = invoice_entity_1.InvoiceStatus.PAID;
        await this.invoiceRepo.save(invoice);
        const transaction = this.txRepo.create({
            amount: invoice.totalAmount,
            source: paymentMethod.toUpperCase(),
            reference: transactionId || `MAN${Date.now()}`,
            status: transaction_entity_1.TransactionStatus.COMPLETED
        });
        await this.txRepo.save(transaction);
        console.log(`[PAYMENT] Invoice #${invoice.invoiceNumber} marked as PAID via ${paymentMethod}`);
        return {
            success: true,
            message: 'Payment confirmed successfully',
            invoice
        };
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_config_entity_1.PaymentConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(service_price_entity_1.ServicePrice)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialService);
//# sourceMappingURL=financial.service.js.map