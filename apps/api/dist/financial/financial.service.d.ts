import { Repository } from 'typeorm';
import { PaymentConfig, PaymentProvider } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction } from './entities/transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
export declare class FinancialService {
    private configRepo;
    private priceRepo;
    private txRepo;
    private invoiceRepo;
    private invoiceItemRepo;
    private doctorRepo;
    constructor(configRepo: Repository<PaymentConfig>, priceRepo: Repository<ServicePrice>, txRepo: Repository<Transaction>, invoiceRepo: Repository<Invoice>, invoiceItemRepo: Repository<InvoiceItem>, doctorRepo: Repository<Doctor>);
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
    getInvoices(user: {
        email: string;
        role: string;
        id: number;
    }): Promise<Invoice[]>;
    getInvoiceById(id: number): Promise<Invoice>;
    updateInvoice(id: number, data: any): Promise<Invoice>;
    deleteInvoice(id: number): Promise<void>;
    getStats(user?: {
        role: string;
        email: string;
    }): Promise<{
        balance: number;
        pendingClearance: number;
        transactions: Transaction[];
    } | {
        totalRevenue: number;
        netRevenue: number;
        totalTransactions: number;
        recentTransactions: Transaction[];
        invoices: {
            pending: number;
            paid: number;
            overdue: number;
            total: number;
            mk_pendingAmount: number;
            mk_paidAmount: number;
            mk_overdueAmount: number;
            pendingAmount: number;
            paidAmount: number;
        };
        paymentStats: {
            mpesa: number;
            visa: number;
            paypal: number;
            cash: number;
            others: number;
        };
    }>;
    getDoctorStats(email: string): Promise<{
        balance: number;
        pendingClearance: number;
        transactions: Transaction[];
    }>;
    initiateMpesaPayment(phoneNumber: string, amount: number, invoiceId: number): Promise<{
        success: boolean;
        message: string;
        checkoutRequestId: string;
    }>;
    handleMpesaCallback(callbackData: any): Promise<{
        success: boolean;
    }>;
    processPayment(appointmentId: number, amount: number, phoneNumber: string): Promise<{
        success: boolean;
        message: string;
    }>;
    confirmInvoicePayment(invoiceId: number, paymentMethod: string, transactionId?: string): Promise<{
        success: boolean;
        message: string;
        invoice: Invoice;
    }>;
    withdrawFunds(userEmail: string, amount: number): Promise<{
        success: boolean;
        newBalance: number;
        transaction: Transaction;
    }>;
}
