import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { PaymentConfig, PaymentProvider } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

import { Invoice, InvoiceStatus } from './entities/invoice.entity';

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
}
