import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { PaymentConfig, PaymentProvider } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';

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
    async createInvoice(data: { customerName: string; customerEmail: string; dueDate?: Date; items: any[] }): Promise<Invoice> {
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
            status: InvoiceStatus.PENDING,
            items,
        });

        return this.invoiceRepo.save(invoice);
    }

    async getInvoices(): Promise<Invoice[]> {
        return this.invoiceRepo.find({ order: { createdAt: 'DESC' }, relations: ['items'] });
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

    async getStats() {
        // Calculate Total Revenue (Sum of COMPLETED transactions)
        const result = await this.txRepo
            .createQueryBuilder('tx')
            .select('SUM(tx.amount)', 'total')
            .where('tx.status IN (:...statuses)', { statuses: [TransactionStatus.COMPLETED, TransactionStatus.SUCCESS] })
            .getRawOne();

        const totalRevenue = result ? parseFloat(result.total) || 0 : 0;
        const totalTransactions = await this.txRepo.count();
        const recentTransactions = await this.txRepo.find({
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['user']
        });

        // Invoice Stats
        const pendingInvoices = await this.invoiceRepo.count({ where: { status: InvoiceStatus.PENDING } });
        const paidInvoices = await this.invoiceRepo.count({ where: { status: InvoiceStatus.PAID } });
        const overdueInvoices = await this.invoiceRepo.count({ where: { status: InvoiceStatus.OVERDUE } });

        // Payment Method Stats
        const sourceStats = await this.txRepo
            .createQueryBuilder('tx')
            .select('tx.source', 'source')
            .addSelect('COUNT(tx.id)', 'count')
            .addSelect('SUM(tx.amount)', 'total')
            .groupBy('tx.source')
            .getRawMany();

        // Format source stats
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

        return {
            totalRevenue,
            totalTransactions,
            recentTransactions,
            invoices: {
                pending: pendingInvoices,
                paid: paidInvoices,
                overdue: overdueInvoices,
                total: pendingInvoices + paidInvoices + overdueInvoices
            },
            paymentStats
        };
    }

    // M-Pesa STK Push (Simulated for demo - replace with actual Safaricom API)
    async initiateMpesaPayment(phoneNumber: string, amount: number, invoiceId: number) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        // In production, integrate with Safaricom Daraja API
        // For now, simulate the STK push
        const checkoutRequestId = `MCL${Date.now()}`;

        console.log(`[MPESA] Initiating STK Push to ${phoneNumber} for KES ${amount}`);
        console.log(`[MPESA] CheckoutRequestID: ${checkoutRequestId}`);

        // Simulate successful payment after 5 seconds (in production, wait for callback)
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

    // M-Pesa Callback Handler
    async handleMpesaCallback(callbackData: any) {
        try {
            const callback = callbackData?.Body?.stkCallback;
            if (!callback) return { success: false };

            const resultCode = callback.ResultCode;

            if (resultCode === 0) {
                // Payment successful
                const metadata = callback.CallbackMetadata?.Item || [];
                const receiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
                const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;

                // Find pending invoice with matching amount
                const invoice = await this.invoiceRepo.findOne({
                    where: {
                        totalAmount: amount,
                        status: InvoiceStatus.PENDING
                    }
                });

                if (invoice) {
                    // Update invoice status
                    invoice.status = InvoiceStatus.PAID;
                    await this.invoiceRepo.save(invoice);

                    // Create transaction record
                    const transaction = this.txRepo.create({
                        amount,
                        source: 'MPESA',
                        reference: receiptNumber,
                        status: TransactionStatus.COMPLETED
                    });
                    await this.txRepo.save(transaction);

                    console.log(`[MPESA] Payment confirmed for Invoice #${invoice.invoiceNumber}`);
                }
            } else {
                console.log(`[MPESA] Payment failed: ${callback.ResultDesc}`);
            }

            return { success: true };
        } catch (error) {
            console.error('[MPESA] Callback error:', error);
            return { success: false };
        }
    }

    // Manual Payment Confirmation
    async confirmInvoicePayment(invoiceId: number, paymentMethod: string, transactionId?: string) {
        const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        if (invoice.status === InvoiceStatus.PAID) {
            throw new BadRequestException('Invoice already paid');
        }

        // Update invoice
        invoice.status = InvoiceStatus.PAID;
        await this.invoiceRepo.save(invoice);

        // Create transaction record
        const transaction = this.txRepo.create({
            amount: invoice.totalAmount,
            source: paymentMethod.toUpperCase(),
            reference: transactionId || `MAN${Date.now()}`,
            status: TransactionStatus.COMPLETED
        });
        await this.txRepo.save(transaction);

        console.log(`[PAYMENT] Invoice #${invoice.invoiceNumber} marked as PAID via ${paymentMethod}`);

        return {
            success: true,
            message: 'Payment confirmed successfully',
            invoice
        };
    }
}
