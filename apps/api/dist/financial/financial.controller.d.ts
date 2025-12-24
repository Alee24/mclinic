import { FinancialService } from './financial.service';
import { PaymentProvider } from './entities/payment-config.entity';
export declare class FinancialController {
    private financialService;
    constructor(financialService: FinancialService);
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
    getInvoices(): Promise<import("./entities/invoice.entity").Invoice[]>;
    getInvoiceById(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    updateInvoice(id: string, body: any): Promise<import("./entities/invoice.entity").Invoice>;
    deleteInvoice(id: string): Promise<void>;
    getStats(): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        recentTransactions: import("./entities/transaction.entity").Transaction[];
        invoices: {
            pending: number;
            paid: number;
            overdue: number;
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
}
