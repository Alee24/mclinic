import { Repository } from 'typeorm';
import { PaymentConfig, PaymentProvider } from './entities/payment-config.entity';
import { ServicePrice } from './entities/service-price.entity';
import { Transaction } from './entities/transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { WalletsService } from '../wallets/wallets.service';
export declare class FinancialService {
    private configRepo;
    private priceRepo;
    private txRepo;
    private invoiceRepo;
    private invoiceItemRepo;
    private doctorRepo;
    private walletsService;
    constructor(configRepo: Repository<PaymentConfig>, priceRepo: Repository<ServicePrice>, txRepo: Repository<Transaction>, invoiceRepo: Repository<Invoice>, invoiceItemRepo: Repository<InvoiceItem>, doctorRepo: Repository<Doctor>, walletsService: WalletsService);
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
        invoiceNumber?: string;
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
        id: number;
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
    getDoctorStats(user: {
        email: string;
        id: number;
    }): Promise<{
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
    releaseFunds(appointmentId: number): Promise<void>;
    withdrawFunds(user: {
        email: string;
        id: number;
    }, amount: number, method: string, details: string): Promise<{
        success: boolean;
        newBalance: number;
        transaction: Transaction;
    }>;
    debugListDoctors(): Promise<Doctor[]>;
    recalculateDoctorBalance(doctorId: number): Promise<{
        success: boolean;
        oldBalance: number;
        newBalance: number;
        totalEarnings: number;
        totalWithdrawals: number;
        invoicesCount: number;
        withdrawalsCount: number;
    }>;
    migrateBalancesToWallets(): Promise<{
        success: boolean;
        migratedCount: number;
        details: ({
            email: string;
            balance: number;
            status: string;
            error?: undefined;
        } | {
            email: string;
            error: any;
            status: string;
            balance?: undefined;
        })[];
    }>;
}
