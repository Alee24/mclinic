import { FinancialService } from './financial.service';
import { PaymentProvider } from './entities/payment-config.entity';
export declare class FinancialController {
    private financialService;
    constructor(financialService: FinancialService);
    withdraw(body: {
        amount: number;
        method: string;
        details: string;
    }, req: any): Promise<{
        success: boolean;
        newBalance: number;
        transaction: import("./entities/transaction.entity").Transaction;
    }>;
    setConfig(body: {
        provider: PaymentProvider;
        credentials: any;
    }): Promise<import("./entities/payment-config.entity").PaymentConfig>;
    getConfig(provider: PaymentProvider): Promise<import("./entities/payment-config.entity").PaymentConfig | null>;
    setPrice(body: {
        serviceName: string;
        amount: number;
        doctorId?: number;
    }): Promise<import("./entities/service-price.entity").ServicePrice>;
    getPrices(doctorId?: number): Promise<import("./entities/service-price.entity").ServicePrice[]>;
    getTransactions(): Promise<import("./entities/transaction.entity").Transaction[]>;
    createInvoice(body: any): Promise<import("./entities/invoice.entity").Invoice>;
    getInvoices(req: any): Promise<import("./entities/invoice.entity").Invoice[]>;
    getInvoiceById(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    updateInvoice(id: string, body: any): Promise<import("./entities/invoice.entity").Invoice>;
    deleteInvoice(id: string): Promise<void>;
    getStats(req: any): Promise<{
        balance: number;
        pendingClearance: number;
        transactions: import("./entities/transaction.entity").Transaction[];
    } | {
        totalRevenue: number;
        netRevenue: number;
        totalTransactions: number;
        recentTransactions: import("./entities/transaction.entity").Transaction[];
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
    initiateMpesaPayment(body: {
        phoneNumber: string;
        amount: number;
        invoiceId: number;
    }): Promise<{
        success: boolean;
        message: string;
        checkoutRequestId: string;
    }>;
    mpesaCallback(body: any): Promise<{
        success: boolean;
    }>;
    confirmPayment(id: string, body: {
        paymentMethod: string;
        transactionId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        invoice: import("./entities/invoice.entity").Invoice;
    }>;
    processPayment(body: {
        appointmentId: number;
        amount: number;
        phoneNumber: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getStatsDebug(email: string): Promise<{
        status: string;
        stats: {
            balance: number;
            pendingClearance: number;
            transactions: import("./entities/transaction.entity").Transaction[];
        };
        message?: undefined;
        email?: undefined;
        availableDoctors?: undefined;
    } | {
        status: string;
        message: any;
        email: string;
        availableDoctors: import("../doctors/entities/doctor.entity").Doctor[];
        stats?: undefined;
    }>;
}
