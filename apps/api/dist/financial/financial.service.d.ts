import { Repository } from 'typeorm';
import { PaymentConfig, PaymentProvider } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction } from './entities/transaction.entity';
import { Invoice } from './entities/invoice.entity';
export declare class FinancialService {
    private configRepo;
    private priceRepo;
    private txRepo;
    private invoiceRepo;
    constructor(configRepo: Repository<PaymentConfig>, priceRepo: Repository<ServicePrice>, txRepo: Repository<Transaction>, invoiceRepo: Repository<Invoice>);
    setConfig(provider: PaymentProvider, credentials: any): Promise<PaymentConfig>;
    getConfig(provider: PaymentProvider): Promise<PaymentConfig | null>;
    setPrice(serviceName: string, amount: number, doctorId?: number): Promise<ServicePrice>;
    getPrices(doctorId?: number): Promise<ServicePrice[]>;
    recordTransaction(data: Partial<Transaction>): Promise<Transaction>;
    getAllTransactions(): Promise<Transaction[]>;
    createInvoice(data: {
        customerName: string;
        customerEmail: string;
        dueDate?: Date;
        items: any[];
    }): Promise<Invoice>;
    getInvoices(): Promise<Invoice[]>;
    getStats(): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        recentTransactions: Transaction[];
        invoices: {
            pending: number;
            paid: number;
            total: number;
        };
        paymentStats: {
            mpesa: number;
            visa: number;
            paypal: number;
            cash: number;
            others: number;
        };
    }>;
    initiateMpesaPayment(phoneNumber: string, amount: number, invoiceId: number): Promise<{
        success: boolean;
        message: string;
        checkoutRequestId: string;
    }>;
    handleMpesaCallback(callbackData: any): Promise<{
        success: boolean;
    }>;
    confirmInvoicePayment(invoiceId: number, paymentMethod: string, transactionId?: string): Promise<{
        success: boolean;
        message: string;
        invoice: Invoice;
    }>;
}
