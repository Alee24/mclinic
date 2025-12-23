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
}
