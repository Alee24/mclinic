import { Invoice } from './invoice.entity';
export declare class InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    invoice: Invoice;
}
